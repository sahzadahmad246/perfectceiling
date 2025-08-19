import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Service } from "@/models/Service"

export async function GET() {
  await connectToDatabase()
  const items = await Service.find({ status: "active" }).sort({ title: 1 }).lean()
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


