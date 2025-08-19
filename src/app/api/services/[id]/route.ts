import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { connectToDatabase } from "@/lib/db"
import { Service } from "@/models/Service"
import { deleteImageByPublicId } from "@/lib/cloudinary"
import { ServiceSchema } from "@/lib/validators/services"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await connectToDatabase()
  const s = await Service.findById(id).lean()
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    id: s._id.toString(),
    categoryId: s.categoryId,
    subcategoryId: s.subcategoryId,
    title: s.title,
    slug: s.slug,
    summary: s.summary || "",
    description: s.description || "",
    content: s.content || "",
    priceRange: s.priceRange || "",
    tags: s.tags || [],
    status: s.status,
    images: Array.isArray((s as unknown as { images?: { url: string; publicId: string }[] }).images)
      ? (s as unknown as { images: { url: string; publicId: string }[] }).images
      : [],
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectToDatabase()
  const body = await req.json()
  const parsed = ServiceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }
  const doc = await Service.findById(id)
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
  Object.assign(doc, parsed.data)
  await doc.save()
  return NextResponse.json({ id })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectToDatabase()
  const doc = await Service.findById(id)
  if (doc) {
    const images = Array.isArray((doc as unknown as { images?: { url: string; publicId: string }[] }).images)
      ? (doc as unknown as { images: { url: string; publicId: string }[] }).images
      : []
    for (const img of images) {
      if (img?.publicId) {
        try { await deleteImageByPublicId(img.publicId) } catch {}
      }
    }
    await doc.deleteOne()
  }
  return NextResponse.json({ ok: true })
}


