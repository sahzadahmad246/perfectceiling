import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { connectToDatabase } from "@/lib/db"
import { Service } from "@/models/Service"
import { ServiceSchema } from "@/lib/validators/services"

export async function GET() {
  await connectToDatabase()
  const items = await Service.find({}).sort({ createdAt: -1 }).lean()
  return NextResponse.json(
    items.map((s) => ({
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
    }))
  )
}

export async function POST(req: NextRequest) {
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
  const created = await Service.create(parsed.data)
  return NextResponse.json({ id: (created as { _id: { toString(): string } })._id.toString() }, { status: 201 })
}


