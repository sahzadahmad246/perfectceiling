import type { Metadata } from "next"
import Link from "next/link"
import { connectToDatabase } from "@/lib/db"
import { Category, type ICategory } from "@/models/Category"
import { Subcategory, type ISubcategory } from "@/models/Subcategory"
import { Service, type IService } from "@/models/Service"

type Params = { category: string; subcategory: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { subcategory } = await params
  await connectToDatabase()
  const sub = await Subcategory.findOne({ slug: subcategory }).lean<ISubcategory | null>()
  const title = sub ? `${sub.name} | Services` : "Services"
  const description = sub?.description || `Explore ${subcategory} services.`
  return { title, description, openGraph: { title, description } }
}

export default async function SubcategoryPage({ params }: { params: Promise<Params> }) {
  const { category, subcategory } = await params
  await connectToDatabase()
  const cat = await Category.findOne({ slug: category }).lean<ICategory | null>()
  const sub = await Subcategory.findOne({ slug: subcategory }).lean<ISubcategory | null>()
  if (!cat || !sub) return <div className="max-w-4xl mx-auto p-6">Not found</div>
  const subId = (sub as unknown as { _id: { toString(): string } })._id.toString()
  const services = await Service.find({ subcategoryId: subId, status: 'active' }).sort({ title: 1 }).lean<IService[]>()
  return (
    <main className="max-w-6xl mx-auto p-6">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/">Home</Link></li>
          <li>/</li>
          <li><Link href="/services">Services</Link></li>
          <li>/</li>
          <li><Link href={`/services/${category}`}>{cat.name}</Link></li>
          <li>/</li>
          <li aria-current="page">{sub.name}</li>
        </ol>
      </nav>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{sub.name}</h1>
        {sub.description && <p className="text-gray-600">{sub.description}</p>}
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((s) => {
          const sid = (s as unknown as { _id: { toString(): string } })._id.toString()
          return (
            <Link href={`/services/${category}/${subcategory}/${s.slug}`} key={sid} className="block border rounded-lg p-4 hover:shadow">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              {s.summary && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{s.summary}</p>}
              {s.priceRange && <p className="text-gray-800 text-sm mt-2">{s.priceRange}</p>}
            </Link>
          )
        })}
      </section>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": sub.name,
        "hasPart": services.map((s)=> ({ "@type": "Service", "name": s.title, "url": `/services/${category}/${subcategory}/${s.slug}` }))
      }) }} />
    </main>
  )
}


