import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are missing");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder = "perfectceiling/users"
): Promise<{ secureUrl: string; publicId: string }>
{
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadImageFromUrl(
  url: string,
  folder = "perfectceiling/users"
): Promise<{ secureUrl: string; publicId: string }>
{
  configureCloudinary();
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return uploadImageBuffer(buffer, folder);
}


