import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const itemSchema = z.object({
  description: z.string().min(1),
  areaSqft: z.number().optional().nullable(),
  ratePerSqft: z.number().optional().nullable(),
  quantity: z.number().optional().nullable(),
  amount: z.number().nonnegative(),
});

const createQuotationSchema = z.object({
  type: z.enum(["DETAILED", "LUMPSUM"]),
  customerName: z.string().min(1),
  customerPhone: z.string().min(5),
  customerAddress: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
  discountAmount: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return NextResponse.json({ quotations });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createQuotationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type, customerName, customerPhone, customerAddress, items, discountAmount, notes } =
    parsed.data;

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const total = Math.max(0, subtotal - discountAmount);

  const created = await prisma.quotation.create({
    data: {
      type,
      customerName,
      customerPhone,
      customerAddress,
      subtotal,
      discountAmount,
      total,
      notes,
      createdById: session.user.id,
      items: {
        create: items.map((i, index) => ({
          description: i.description,
          areaSqft: i.areaSqft ?? null,
          ratePerSqft: i.ratePerSqft ? new Decimal(i.ratePerSqft) : null,
          quantity: i.quantity ?? 1,
          amount: new Decimal(i.amount),
          orderIndex: index,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ quotation: created }, { status: 201 });
}
