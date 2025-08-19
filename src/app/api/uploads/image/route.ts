import { NextRequest, NextResponse } from "next/server"
import { uploadImageBuffer } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as unknown as File | null
    const folder = (form.get("folder") as string) || "perfectceiling/uploads"
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const { secureUrl, publicId } = await uploadImageBuffer(buffer, folder)

    return NextResponse.json({ url: secureUrl, publicId })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}


