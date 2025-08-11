import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  const arrayBuffer = await file.arrayBuffer();
  const base64 = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, { folder: "perfectceiling" });
  return Response.json({ url: result.secure_url });
}


