import type { Metadata } from "next"
import Link from "next/link"
import { connectToDatabase } from "@/lib/db"
import { Category, type ICategory } from "@/models/Category"
import { Subcategory, type ISubcategory } from "@/models/Subcategory"

type Params = { category: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params
  await connectToDatabase()
  const cat = await Category.findOne({ slug: category }).lean<ICategory | null>()
  const title = cat ? `${cat.name} | Services` : "Services"
  const description = cat?.description || `Explore ${category} services.`
  return { title, description, openGraph: { title, description } }
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params
  await connectToDatabase()
  const cat = await Category.findOne({ slug: category }).lean<ICategory | null>()
  if (!cat) return <div className="max-w-4xl mx-auto p-6">Category not found</div>
  const catId = (cat as unknown as { _id: { toString(): string } })._id.toString()
  const subs = await Subcategory.find({ categoryId: catId }).sort({ name: 1 }).lean<ISubcategory[]>()
  return (
    <main className="max-w-6xl mx-auto p-6">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/">Home</Link></li>
          <li>/</li>
          <li><Link href="/services">Services</Link></li>
          <li>/</li>
          <li aria-current="page">{cat.name}</li>
        </ol>
      </nav>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{cat.name}</h1>
        {cat.description && <p className="text-gray-600">{cat.description}</p>}
      </header>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subs.map((s) => {
          const sid = (s as unknown as { _id: { toString(): string } })._id.toString()
          return (
            <Link href={`/services/${category}/${s.slug}`} key={sid} className="block border rounded-lg p-4 hover:shadow">
              <h2 className="text-xl font-semibold">{s.name}</h2>
              {s.description && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{s.description}</p>}
            </Link>
          )
        })}
      </section>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": cat.name,
        "hasPart": subs.map((s)=> ({ "@type": "ItemList", "name": s.name, "url": `/services/${category}/${s.slug}` }))
      }) }} />
    </main>
  )
}


