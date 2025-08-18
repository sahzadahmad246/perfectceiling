import type { Metadata } from "next"
import Link from "next/link"
import { connectToDatabase } from "@/lib/db"
import { Category } from "@/models/Category"
import { Subcategory } from "@/models/Subcategory"
import { Service } from "@/models/Service"

type Params = { category: string; subcategory: string; service: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { service } = await params
  await connectToDatabase()
  const s = await Service.findOne({ slug: service }).lean()
  const title = s ? `${s.title} | Perfect Ceiling` : "Service"
  const description = s?.summary || s?.description || undefined
  const keywords = s?.tags || []
  return { title, description, keywords, openGraph: { title, description }, twitter: { card: 'summary_large_image', title, description } }
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { category, subcategory, service } = await params
  await connectToDatabase()
  const cat = await Category.findOne({ slug: category }).lean()
  const sub = await Subcategory.findOne({ slug: subcategory }).lean()
  const s = await Service.findOne({ slug: service }).lean()
  if (!cat || !sub || !s) return <div className="max-w-4xl mx-auto p-6">Not found</div>
  return (
    <main className="max-w-4xl mx-auto p-6">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/">Home</Link></li>
          <li>/</li>
          <li><Link href="/services">Services</Link></li>
          <li>/</li>
          <li><Link href={`/services/${category}`}>{cat.name}</Link></li>
          <li>/</li>
          <li><Link href={`/services/${category}/${subcategory}`}>{sub.name}</Link></li>
          <li>/</li>
          <li aria-current="page">{s.title}</li>
        </ol>
      </nav>
      <article>
        <header className="mb-4">
          <h1 className="text-3xl font-bold">{s.title}</h1>
          {s.summary && <p className="text-gray-600 mt-2">{s.summary}</p>}
          {s.priceRange && <p className="text-gray-800 mt-2 font-medium">{s.priceRange}</p>}
        </header>
        {s.description && <p className="text-gray-700 mb-4">{s.description}</p>}
        {s.content && <div className="prose" dangerouslySetInnerHTML={{ __html: s.content }} />}
        {s.tags?.length ? (
          <ul className="flex flex-wrap gap-2 mt-4 text-sm text-gray-600">
            {s.tags.map((t: string)=> (<li key={t} className="px-2 py-1 bg-gray-100 rounded">#{t}</li>))}
          </ul>
        ) : null}
      </article>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": s.title,
        "description": s.summary || s.description,
        "areaServed": "India",
        "offers": s.priceRange ? { "@type": "Offer", "price": s.priceRange } : undefined,
      }) }} />
    </main>
  )
}


