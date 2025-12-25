import type { Metadata } from "next"
import { connectToDatabase } from "@/lib/db"
import { Service, type IService } from "@/models/Service"
import { Category, type ICategory } from "@/models/Category"
import ServiceClientPage from "@/components/services/ServiceClientPage"
import CategoryClientPage from "@/components/services/CategoryClientPage"
import { notFound } from "next/navigation"

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { slug } = await params
    await connectToDatabase()

    // Try finding category first
    const cat = await Category.findOne({ slug }).lean<ICategory | null>()
    if (cat) {
        const title = `${cat.name} | Services`
        const description = cat.description || `Explore ${cat.name} services.`
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

    // Try finding service
    const service = await Service.findOne({ slug }).lean<IService | null>()
    if (service) {
        return {
            title: `${service.title} | Perfect Ceiling`,
            description: service.summary || service.description || `Professional ${service.title} services.`,
            openGraph: {
                title: `${service.title} | Perfect Ceiling`,
                description: service.summary || service.description || `Professional ${service.title} services.`,
                type: "website",
                images: service.images?.[0]?.url ? [{ url: service.images[0].url }] : undefined,
            },
        }
    }

    return {
        title: "Not Found | Perfect Ceiling",
    }
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { slug } = await params
    await connectToDatabase()

    // Try finding category
    const cat = await Category.findOne({ slug }).lean<ICategory | null>()
    if (cat) {
        return <CategoryClientPage category={slug} />
    }

    // Try finding service
    const service = await Service.findOne({ slug }).lean<IService | null>()
    if (service) {
        return <ServiceClientPage slug={slug} />
    }

    notFound()
}
