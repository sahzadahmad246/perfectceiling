// app/api/quotations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { Quotation, IQuotation } from "@/models/Quotation";
import { QuotationSchema } from "@/lib/validators/quotationValidator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <-- treat as Promise
) {
  const { id } = await params; // <-- await it first
  await connectToDatabase();
  const quotation = await Quotation.findById(id).lean<IQuotation>();
  if (!quotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: quotation._id.toString(),
    clientInfo: quotation.clientInfo,
    workDetails: quotation.workDetails,
    status: quotation.status,
    rejectionReason: quotation.rejectionReason,
    customerNote: quotation.customerNote,
    sharing: quotation.sharing || {
      isShared: false,
      shareToken: null,
      sharedAt: null,
      sharedBy: null,
      accessCount: 0,
      lastAccessedAt: null,
    },
    createdAt: quotation.createdAt,
    updatedAt: quotation.updatedAt,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <-- treat as Promise
) {
  const { id } = await params; // <-- await it first
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const body = await req.json();
  const parsed = QuotationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  const quotation = await Quotation.findById(id);
  if (!quotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  Object.assign(quotation, { ...parsed.data, createdByUserId: session.user.id });
  await quotation.save();
  return NextResponse.json({ id }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // <-- await it first
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const quotation = await Quotation.findById(id);
  if (quotation) await quotation.deleteOne();
  return NextResponse.json({ ok: true });
}
