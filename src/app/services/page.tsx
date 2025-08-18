import type { Metadata } from "next"
import Link from "next/link"
import { connectToDatabase } from "@/lib/db"
import { Category, type ICategory } from "@/models/Category"

export const metadata: Metadata = {
  title: "Services | Perfect Ceiling",
  description: "Explore our services organized by category and subcategory.",
  openGraph: { title: "Services | Perfect Ceiling", description: "Explore our services organized by category and subcategory.", type: "website" },
}

export default async function ServicesPage() {
  await connectToDatabase()
  const cats = await Category.find({}).sort({ name: 1 }).lean<ICategory[]>()
  return (
    <main className="max-w-6xl mx-auto p-6">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
        <ol className="inline-flex items-center space-x-2">
          <li><Link href="/">Home</Link></li>
          <li>/</li>
          <li aria-current="page">Services</li>
        </ol>
      </nav>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-gray-600">Browse categories to find the right service.</p>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cats.map((c) => {
          const cid = (c as unknown as { _id: { toString(): string } })._id.toString()
          return (
            <Link href={`/services/${c.slug}`} key={cid} className="block border rounded-lg p-4 hover:shadow">
              <h2 className="text-xl font-semibold">{c.name}</h2>
              {c.description && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{c.description}</p>}
            </Link>
          )
        })}
      </section>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Services",
        "hasPart": cats.map((c)=> ({ "@type": "ItemList", "name": c.name, "url": `/services/${c.slug}` }))
      }) }} />
    </main>
  )
}


