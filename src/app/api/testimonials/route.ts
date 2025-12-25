import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { connectToDatabase } from "@/lib/db"
import { Testimonial } from "@/models/Testimonial"

import { TestimonialSchema } from "@/lib/validators/services"

export async function GET(req: NextRequest) {
  await connectToDatabase()
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get("categoryId") || undefined
  const status = (searchParams.get("status") as "published" | "hidden" | null) || "published"

  const filter: { categoryId?: string; status?: "published" | "hidden" } = {}
  if (categoryId) filter.categoryId = categoryId
  if (status) filter.status = status

  const raw = await Testimonial.find(filter).sort({ createdAt: -1 }).lean()
  type DbTestimonial = {
    _id: { toString(): string }
    authorName: string
    message: string
    categoryId: string
    status: "published" | "hidden"
    createdAt: Date
    updatedAt: Date
  }
  const items = raw as unknown as DbTestimonial[]
  return NextResponse.json(
    items.map((t) => ({
      id: t._id.toString(),
      authorName: t.authorName,
      message: t.message,
      categoryId: t.categoryId,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
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
  const parsed = TestimonialSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }
  const created = await Testimonial.create(parsed.data)
  const createdId = (created as unknown as { _id: { toString(): string } })._id.toString()
  return NextResponse.json({ id: createdId }, { status: 201 })
}


