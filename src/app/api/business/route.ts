import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { BusinessSettings, IBusinessSettings } from "@/models/BusinessSettings";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { Types } from "mongoose";

export const runtime = "nodejs";

interface BusinessSettingsPayload {
  name?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  status?: string;
  terms?: string[];
  logoUrl?: string;
  logoPublicId?: string;
  updatedByUserId?: string;
}

// Get current business settings (singleton)
export async function GET() {
  await connectToDatabase();
  const doc = await BusinessSettings.findOne({}).sort({ updatedAt: -1 }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: (doc._id as Types.ObjectId).toString(),
    name: doc.name,
    primaryPhone: doc.primaryPhone,
    secondaryPhone: doc.secondaryPhone,
    status: doc.status,
    terms: doc.terms,
    logoUrl: doc.logoUrl,
    logoPublicId: doc.logoPublicId,
    updatedAt: doc.updatedAt,
  });
}

// Create settings (admin only). Accepts multipart (for logo) or JSON
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();

  const contentType = req.headers.get("content-type") || "";
  let payload: BusinessSettingsPayload = {};
  let logoBuffer: Buffer | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    payload.name = (form.get("name") as string) || "";
    payload.primaryPhone = (form.get("primaryPhone") as string) || "";
    payload.secondaryPhone = (form.get("secondaryPhone") as string) || undefined;
    payload.status = (form.get("status") as string) || undefined;
    const terms = form.getAll("terms[]").map((t) => String(t)).filter(Boolean);
    payload.terms = terms;
    const file = form.get("logo") as File | null;
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      logoBuffer = Buffer.from(arrayBuffer);
    }
  } else {
    payload = await req.json() as BusinessSettingsPayload;
  }

  if (!payload.name || !payload.primaryPhone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (logoBuffer) {
    const up = await uploadImageBuffer(logoBuffer, "perfectceiling/business");
    payload.logoUrl = up.secureUrl;
    payload.logoPublicId = up.publicId;
  }

  payload.updatedByUserId = session.user?.id;
  const created = await BusinessSettings.create(payload);
  return NextResponse.json({ id: (created._id as Types.ObjectId).toString() }, { status: 201 });
}

// Update settings (admin). Accepts multipart (for logo) or JSON
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();

  const contentType = req.headers.get("content-type") || "";
  let payload: BusinessSettingsPayload = {};
  let logoBuffer: Buffer | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    if (form.has("name")) payload.name = form.get("name") as string;
    if (form.has("primaryPhone")) payload.primaryPhone = form.get("primaryPhone") as string;
    if (form.has("secondaryPhone")) payload.secondaryPhone = (form.get("secondaryPhone") as string) || undefined;
    if (form.has("status")) payload.status = form.get("status") as string;
    const terms = form.getAll("terms[]").map((t) => String(t)).filter(Boolean);
    if (terms.length) payload.terms = terms;
    const file = form.get("logo") as File | null;
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      logoBuffer = Buffer.from(arrayBuffer);
    }
  } else {
    payload = await req.json() as BusinessSettingsPayload;
  }

  if (logoBuffer) {
    const up = await uploadImageBuffer(logoBuffer, "perfectceiling/business");
    payload.logoUrl = up.secureUrl;
    payload.logoPublicId = up.publicId;
  }

  payload.updatedByUserId = session.user?.id;

  const existing = await BusinessSettings.findOne({}).sort({ updatedAt: -1 });
  if (!existing) {
    const created = await BusinessSettings.create(payload);
    return NextResponse.json({ id: (created._id as Types.ObjectId).toString() }, { status: 201 });
  }
  Object.assign(existing, payload);
  await existing.save();
  return NextResponse.json({ id: (existing._id as Types.ObjectId).toString() }, { status: 200 });
}

// Delete settings (admin) — removes the latest doc
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const existing = await BusinessSettings.findOne({}).sort({ updatedAt: -1 });
  if (!existing) return NextResponse.json({ ok: true });
  await existing.deleteOne();
  return NextResponse.json({ ok: true });
}