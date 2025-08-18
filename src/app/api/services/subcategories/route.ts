import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { connectToDatabase } from "@/lib/db"
import { Subcategory } from "@/models/Subcategory"
import { SubcategorySchema } from "@/lib/validators/services"

export async function GET() {
  await connectToDatabase()
  const items = await Subcategory.find({}).sort({ name: 1 }).lean()
  return NextResponse.json(
    items.map((s) => ({
      id: s._id.toString(),
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      description: s.description || "",
      image: s.image,
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
  const parsed = SubcategorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }
  const created = await Subcategory.create(parsed.data)
  return NextResponse.json({ id: (created as { _id: { toString(): string } })._id.toString() }, { status: 201 })
}


