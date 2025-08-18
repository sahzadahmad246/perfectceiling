import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { connectToDatabase } from "@/lib/db"
import { Category } from "@/models/Category"
import { CategorySchema } from "@/lib/validators/services"

export async function GET() {
  await connectToDatabase()
  const items = await Category.find({}).sort({ name: 1 }).lean()
  return NextResponse.json(
    items.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      images: c.images || [],
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
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
  const parsed = CategorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }
  const created = await Category.create(parsed.data)
  return NextResponse.json({ id: (created as { _id: { toString(): string } })._id.toString() }, { status: 201 })
}


