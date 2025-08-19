import type { Metadata } from "next"
import { connectToDatabase } from "@/lib/db"
import { Service } from "@/models/Service"
import ServiceClientPage from "@/components/services/ServiceClientPage"

type Params = { category: string; subcategory: string; service: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { service } = await params
  await connectToDatabase()
  const s = await Service.findOne({ slug: service }).lean()
  const title = s ? `${s.title} | Perfect Ceiling` : "Service"
  const description = s?.summary || s?.description || undefined
  const keywords = s?.tags || []
  return {
    title,
    description,
    keywords,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { category, subcategory, service } = await params
  return <ServiceClientPage category={category} subcategory={subcategory} service={service} />
}
