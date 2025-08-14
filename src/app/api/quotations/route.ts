import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { Quotation, IQuotation } from "@/models/Quotation";
import { QuotationSchema } from "@/lib/validators/quotationValidator";

export async function GET() {
  await connectToDatabase();
  const quotations = await Quotation.find({})
    .sort({ createdAt: -1 })
    .lean<IQuotation[]>();

  return NextResponse.json(
    quotations.map((q) => ({
      id: q._id.toString(),
      clientInfo: q.clientInfo,
      workDetails: q.workDetails,
      status: q.status,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Forbidden - No session" }, { status: 403 });
  }
  if (session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Not admin" }, { status: 403 });
  }

  await connectToDatabase();
  const body = await req.json();
  const parsed = QuotationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const quotation = await Quotation.create({
    ...parsed.data,
    createdByUserId: session.user.id,
  });

  return NextResponse.json(
    { id: quotation._id.toString() },
    { status: 201 }
  );
}
