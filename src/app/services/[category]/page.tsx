import type { Metadata } from "next"
import { connectToDatabase } from "@/lib/db"
import { Category, type ICategory } from "@/models/Category"
import CategoryClientPage from "@/components/services/CategoryClientPage"

type Params = { category: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params
  await connectToDatabase()
  const cat = await Category.findOne({ slug: category }).lean<ICategory | null>()
  const title = cat ? `${cat.name} | Services` : "Services"
  const description = cat?.description || `Explore ${category} services and subcategories.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params
  return <CategoryClientPage category={category} />
}
