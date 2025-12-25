"use client"
import Link from "next/link"
/* eslint-disable @next/next/no-img-element */
import type { CategoryDTO, ServiceDTO } from "@/types/services"
import { Layers, Home, ChevronRight, Briefcase, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function CategoryClientPage({ category }: { category: string }) {
  const [cat, setCat] = useState<CategoryDTO | null>(null)
  const [services, setServices] = useState<ServiceDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [categoriesRes, servicesRes] = await Promise.all([
          fetch(`/api/services/categories`),
          fetch(`/api/services/list`),
        ])

        const [categories, services] = await Promise.all([
          categoriesRes.json(),
          servicesRes.json(),
        ])

        const currentCategory = (categories as CategoryDTO[]).find((c) => c.slug === category) || null
        setCat(currentCategory)

        if (currentCategory) {
          setServices((services as ServiceDTO[]).filter((s) => s.categoryId === currentCategory.id))
        } else {
          setServices([])
        }
      } catch (error) {
        console.error("Could not fetch category data:", error)
        setCat(null)
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!cat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Category not found</h1>
          <Link href="/services" className="text-sm sm:text-base text-blue-600 hover:text-blue-700">
            ← Back to Services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style jsx global>{`
        .rich-content h1 { @apply text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 mt-4 sm:mt-6; }
        .rich-content h2 { @apply text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800 mb-2 sm:mb-3 mt-3 sm:mt-5; }
        .rich-content h3 { @apply text-base sm:text-lg lg:text-xl font-medium text-slate-700 mb-2 mt-3 sm:mt-4; }
        .rich-content p { @apply text-sm sm:text-base text-slate-600 mb-2 sm:mb-3 leading-relaxed; }
        .rich-content strong { @apply font-semibold text-slate-900; }
        .rich-content em { @apply italic; }
        .rich-content u { @apply underline; }
        .rich-content s { @apply line-through; }
        .rich-content code { @apply bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono text-slate-800; }
        .rich-content blockquote { @apply border-l-4 border-blue-500 pl-3 sm:pl-4 italic text-slate-600 my-3 sm:my-4; }
        .rich-content ul { @apply list-disc list-inside mb-2 sm:mb-3 text-sm sm:text-base text-slate-600; }
        .rich-content ol { @apply list-decimal list-inside mb-2 sm:mb-3 text-sm sm:text-base text-slate-600; }
        .rich-content li { @apply mb-1; }
        .rich-content a { @apply text-blue-600 hover:text-blue-800 underline; }
      `}</style>

      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-slate-500">
              <li className="flex items-center">
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <Link href="/" className="ml-1 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
              <li>
                <Link href="/services" className="hover:text-blue-600 transition-colors">
                  Services
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
              <li aria-current="page" className="text-slate-900 font-medium">
                {cat.name}
              </li>
            </ol>
          </nav>

          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3 sm:mb-4">
              {cat.name}
            </h1>
            {Array.isArray(cat.images) && cat.images.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <img
                  src={cat.images[0].url || "/placeholder.svg"}
                  alt={cat.name}
                  className="w-full max-w-md sm:max-w-xl mx-auto rounded-xl border"
                />
              </div>
            )}
            {cat.description && (
              <div className="rich-content max-w-2xl mx-auto px-2">
                <div dangerouslySetInnerHTML={{ __html: cat.description }} />
              </div>
            )}
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{services.length} Services</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {services.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 px-1">All {cat.name} Services</h2>
            <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const serviceId = service.id
                const imageUrl = service.images?.[0]?.url || cat.images?.[0]?.url
                return (
                  <Link
                    href={`/services/${service.slug}`}
                    key={serviceId}
                    className="group block"
                  >
                    <div className="h-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300">
                      {imageUrl && (
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={service.title}
                          className="w-full h-28 sm:h-32 lg:h-36 object-cover"
                        />
                      )}
                      <div className="p-3 sm:p-4 lg:p-6">
                        <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                              {service.title}
                            </h3>
                            {service.priceRange && (
                              <p className="text-xs sm:text-sm font-medium text-blue-600 mt-1">{service.priceRange}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
                          <span className="text-xs sm:text-sm text-slate-500">View details</span>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {services.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No services available</h3>
            <p className="text-sm sm:text-base text-slate-500">
              This category doesn&apos;t have any services yet.
            </p>
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: cat.name,
            description: cat.description,
            hasPart: services.map((s) => ({
              "@type": "Service",
              name: s.title,
              url: `/services/${s.slug}`,
            })),
          }),
        }}
      />
    </div>
  )
}
