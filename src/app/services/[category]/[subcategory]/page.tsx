import type { Metadata } from "next"
import { connectToDatabase } from "@/lib/db"
import { Subcategory, type ISubcategory } from "@/models/Subcategory"
import SubcategoryClientPage from "@/components/services/SubcategoryClientPage"

type Params = { category: string; subcategory: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { subcategory } = await params
  await connectToDatabase()
  const sub = await Subcategory.findOne({ slug: subcategory }).lean<ISubcategory | null>()
  const title = sub ? `${sub.name} | Services` : "Services"
  const description = sub?.description || `Explore ${subcategory} services with detailed information and pricing.`
  return { title, description, openGraph: { title, description } }
}

export default async function SubcategoryPage({ params }: { params: Promise<Params> }) {
  const { category, subcategory } = await params
  return <SubcategoryClientPage category={category} subcategory={subcategory} />
}
