import { connectToDatabase } from "@/lib/db";
import { Service } from "@/models/Service";
import { Category } from "@/models/Category";
import { Subcategory } from "@/models/Subcategory";
import { Testimonial } from "@/models/Testimonial";
import { BusinessSettings } from "@/models/BusinessSettings";

// Helper types
interface ImageRef {
  url: string;
  publicId: string;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface DbService {
  _id: { toString(): string };
  title: string;
  slug: string;
  priceRange?: string;
  images?: ImageRef[];
  status: string;
  categoryId: string;
  subcategoryId: string;
  summary?: string;
  description?: string;
  content?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface DbCategory {
  images?: ImageRef[];
}

interface DbSubcategory {
  image?: ImageRef;
}

interface DbTestimonial {
  _id: { toString(): string };
  authorName: string;
  message: string;
  subcategoryId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DbBusinessSettings {
  name: string;
  phone?: string;
  primaryPhone?: string;
  email: string;
  address: string;
}


export async function getHeroImages() {
  try {
    await connectToDatabase();

    const services = await Service.find({ "images.0": { $exists: true } })
      .select("images")
      .lean<DbService[]>();
    const categories = await Category.find({ "images.0": { $exists: true } })
      .select("images")
      .lean<DbCategory[]>();
    const subcategories = await Subcategory.find({ image: { $exists: true } })
      .select("image")
      .lean<DbSubcategory[]>();

    const allImages: ImageRef[] = [
      ...services.flatMap((s) => s.images || []),
      ...categories.flatMap((c) => c.images || []),
      ...subcategories
        .map((sc) => sc.image)
        .filter((img): img is ImageRef => img !== null && img !== undefined),
    ];

    if (allImages.length === 0) return [];
    
    // We shuffle a clear copy to avoid side effects if needed, 
    // though shuffleArray creates a copy already.
    const shuffled = shuffleArray(allImages);
    return shuffled.slice(0, 4);
  } catch (error) {
    console.error("Error fetching hero images:", error);
    return [];
  }
}

export async function getPublishedTestimonials() {
  try {
    await connectToDatabase();
    const raw = await Testimonial.find({ status: "published" })
      .sort({ createdAt: -1 })
      .lean<DbTestimonial[]>();
    
    return raw.map((t) => ({
      id: t._id.toString(),
      authorName: t.authorName,
      message: t.message,
      subcategoryId: t.subcategoryId,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

export async function getServiceList() {
  try {
    await connectToDatabase();
    const items = await Service.find({ status: "active" })
      .sort({ title: 1 })
      .lean<DbService[]>();

    return items.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      priceRange: s.priceRange || "",
      images: Array.isArray(s.images) ? s.images : [],
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export async function getBusinessInfo() {
  try {
    await connectToDatabase();
    const info = await BusinessSettings.findOne({}).lean<DbBusinessSettings>();
    if (!info) {
      return {
        name: "Perfect Ceiling",
        phone: "+91 9876543210",
        email: "info@perfectceiling.com",
        address: "123 Business Street, City, State 12345",
      };
    }
    return {
      name: info.name,
      phone: info.primaryPhone || info.phone,
      email: info.email,
      address: info.address,
      primaryPhone: info.primaryPhone
    };
  } catch (error) {
    console.error("Error fetching business info:", error);
    return {};
  }
}
