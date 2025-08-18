import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { connectToDatabase } from "@/lib/db"
import { Category } from "@/models/Category"
import { CategorySchema } from "@/lib/validators/services"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await connectToDatabase()
  const c = await Category.findById(id).lean()
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    images: c.images || [],
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
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
  const parsed = CategorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }
  const doc = await Category.findById(id)
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
  const doc = await Category.findById(id)
  if (doc) await doc.deleteOne()
  return NextResponse.json({ ok: true })
}


