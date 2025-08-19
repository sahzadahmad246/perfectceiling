"use client"
import Link from "next/link"
/* eslint-disable @next/next/no-img-element */
import type { CategoryDTO, SubcategoryDTO, ServiceDTO } from "@/types/services"
import { Briefcase, Settings, Tag, ArrowRight, Home, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function SubcategoryClientPage({ category, subcategory }: { category: string; subcategory: string }) {
  const [cat, setCat] = useState<CategoryDTO | null>(null)
  const [sub, setSub] = useState<SubcategoryDTO | null>(null)
  const [services, setServices] = useState<ServiceDTO[]>([])
  const [testimonials, setTestimonials] = useState<Array<{ id: string; authorName: string; message: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [categoriesRes, subcategoriesRes, servicesRes] = await Promise.all([
          fetch(`/api/services/categories`),
          fetch(`/api/services/subcategories`),
          fetch(`/api/services/list`),
        ])

        const [categories, subcategories, services] = await Promise.all([
          categoriesRes.json(),
          subcategoriesRes.json(),
          servicesRes.json(),
        ])

        const currentCategory = (categories as CategoryDTO[]).find((c) => c.slug === category) || null
        const currentSubcategory = (subcategories as SubcategoryDTO[]).find((s) => s.slug === subcategory) || null
        const filteredServices = currentSubcategory
          ? (services as ServiceDTO[]).filter((svc) => svc.subcategoryId === (currentSubcategory as SubcategoryDTO).id)
          : []

        setCat(currentCategory)
        setSub(currentSubcategory)
        setServices(filteredServices)

        if (currentSubcategory) {
          const tRes = await fetch(`/api/testimonials?subcategoryId=${currentSubcategory.id}&status=published`)
          if (tRes.ok) {
            const t = await tRes.json()
            setTestimonials(t)
          }
        } else {
          setTestimonials([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category, subcategory])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-slate-600 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    )
  }

  if (!cat || !sub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
          <Link href="/services" className="text-blue-600 hover:text-blue-700 text-sm sm:text-base">
            ← Back to Services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style jsx global>{`
        .rich-content h1 { @apply text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 mt-3 sm:mt-4; }
        .rich-content h2 { @apply text-base sm:text-lg lg:text-xl font-semibold text-slate-800 mb-2 mt-3 sm:mt-4; }
        .rich-content h3 { @apply text-sm sm:text-base lg:text-lg font-medium text-slate-700 mb-1 sm:mb-2 mt-2 sm:mt-3; }
        .rich-content p { @apply text-xs sm:text-sm lg:text-base text-slate-600 mb-2 sm:mb-3 leading-relaxed; }
        .rich-content strong { @apply font-semibold text-slate-900; }
        .rich-content em { @apply italic; }
        .rich-content u { @apply underline; }
        .rich-content s { @apply line-through; }
        .rich-content code { @apply bg-slate-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono text-slate-800; }
        .rich-content blockquote { @apply border-l-2 sm:border-l-4 border-blue-500 pl-2 sm:pl-4 italic text-slate-600 my-2 sm:my-4; }
        .rich-content ul { @apply list-disc list-inside mb-2 sm:mb-3 text-xs sm:text-sm lg:text-base text-slate-600; }
        .rich-content ol { @apply list-decimal list-inside mb-2 sm:mb-3 text-xs sm:text-sm lg:text-base text-slate-600; }
        .rich-content li { @apply mb-0.5 sm:mb-1; }
        .rich-content a { @apply text-blue-600 hover:text-blue-800 underline; }
      `}</style>

      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-500">
              <li className="flex items-center">
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <Link href="/" className="ml-1 hover:text-blue-600 transition-colors truncate">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
              <li className="truncate">
                <Link href="/services" className="hover:text-blue-600 transition-colors">
                  Services
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
              <li className="truncate">
                <Link href={`/services/${category}`} className="hover:text-blue-600 transition-colors">
                  {cat.name}
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
              <li aria-current="page" className="text-slate-900 font-medium truncate">
                {sub.name}
              </li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3 sm:mb-4">
              {sub.name}
            </h1>
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-1 sm:gap-2">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{services.length} Services</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{cat.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const serviceId = service.id
            const imageUrl = service.images?.[0]?.url || sub.image?.url || cat.images?.[0]?.url
            return (
              <Link
                href={`/services/${category}/${subcategory}/${service.slug}`}
                key={serviceId}
                className="group block"
              >
                <div className="h-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300">
                  {imageUrl && (
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={service.title}
                      className="w-full h-32 sm:h-36 lg:h-40 object-cover"
                    />
                  )}

                  <div className="p-3 sm:p-4 lg:p-6">
                    {/* Service Header */}
                    <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
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

                   

                    {/* Learn More Link */}
                    <div className="flex items-center justify-between pt-2 sm:pt-3 lg:pt-4 border-t border-slate-100">
                      <span className="text-xs sm:text-sm text-slate-500">View details</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No services available</h3>
            <p className="text-sm sm:text-base text-slate-500 mb-4">
              This subcategory doesn&apos;t have any active services yet.
            </p>
            <Link
              href={`/services/${category}`}
              className="inline-flex items-center gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Back to {cat.name}
            </Link>
          </div>
        )}

        {/* Testimonials */}
        {testimonials && testimonials.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-bold text-center mb-6">what our clients say</h2>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="p-6 rounded-xl border bg-white shadow-sm"
        >
          <p className="text-slate-600 mb-4">“{testimonial.message}”</p>
          <div className="font-medium text-slate-900">{testimonial.authorName}</div>
          
        </div>
      ))}
    </div>
  </div>
)}

      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: sub.name,
            description: sub.description,
            hasPart: services.map((service) => ({
              "@type": "Service",
              name: service.title,
              description: service.summary || service.description,
              url: `/services/${category}/${subcategory}/${service.slug}`,
              offers: service.priceRange
                ? {
                    "@type": "Offer",
                    price: service.priceRange,
                  }
                : undefined,
            })),
          }),
        }}
      />
    </div>
  )
}
