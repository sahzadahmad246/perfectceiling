import { NextResponse } from "next/server";
import { Service } from "@/models/Service";
import { Category } from "@/models/Category";
import { connectToDatabase } from "@/lib/db";

// Define response data type
interface ImageRef {
  url: string;
  publicId: string;
}

// Function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Named export for GET method
export async function GET() {
  try {
    await connectToDatabase(); 

    // Fetch all images from Service and Category
    const services = await Service.find({ "images.0": { $exists: true } })
      .select("images")
      .lean();
    const categories = await Category.find({ "images.0": { $exists: true } })
      .select("images")
      .lean();

    // Aggregate all images into a single array
    const allImages: ImageRef[] = [
      ...services.flatMap((service) => service.images || []),
      ...categories.flatMap((category) => category.images || []),
    ];

    // If no images are found
    if (allImages.length === 0) {
      return NextResponse.json({ success: false, error: "No images found" }, { status: 404 });
    }

    // Shuffle images to ensure randomness
    const shuffledImages = shuffleArray(allImages);

    // Select up to 4 unique images
    const selectedImages = shuffledImages.slice(0, Math.min(4, shuffledImages.length));

    return NextResponse.json({ success: true, data: selectedImages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}