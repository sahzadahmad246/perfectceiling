"use client"

import Link from "next/link"
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react"
import type { CategoryDTO, SubcategoryDTO, ServiceDTO } from "@/types/services"
import { Briefcase, Tag, DollarSign, Home, ChevronRight, ArrowLeft } from "lucide-react"

interface ServiceClientPageProps {
  category: string
  subcategory: string
  service: string
}

export default function ServiceClientPage({ category, subcategory, service }: ServiceClientPageProps) {
  const [cat, setCat] = useState<CategoryDTO | null>(null)
  const [sub, setSub] = useState<SubcategoryDTO | null>(null)
  const [s, setS] = useState<ServiceDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [testimonials, setTestimonials] = useState<Array<{ id: string; authorName: string; message: string }>>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lists and resolve by slug client-side since our API uses IDs
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
        const currentService = (services as ServiceDTO[]).find((svc) => svc.slug === service) || null

        setCat(currentCategory)
        setSub(currentSubcategory)
        setS(currentService)

        if (currentSubcategory) {
          const tRes = await fetch(`/api/testimonials?subcategoryId=${currentSubcategory.id}&status=published`)
          if (tRes.ok) {
            const t = await tRes.json()
            setTestimonials(t)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category, subcategory, service])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!cat || !sub || !s) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2">Service not found</h1>
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
        .rich-content h1 { @apply text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 lg:mb-4 mt-3 sm:mt-4 lg:mt-6; }
        .rich-content h2 { @apply text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-slate-800 mb-2 sm:mb-3 mt-3 sm:mt-4 lg:mt-5; }
        .rich-content h3 { @apply text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-slate-700 mb-1 sm:mb-2 mt-2 sm:mt-3 lg:mt-4; }
        .rich-content h4 { @apply text-sm sm:text-base lg:text-lg font-medium text-slate-700 mb-1 sm:mb-2 mt-2 sm:mt-3; }
        .rich-content h5 { @apply text-xs sm:text-sm lg:text-base font-medium text-slate-700 mb-1 mt-2 sm:mt-3; }
        .rich-content h6 { @apply text-xs sm:text-sm font-medium text-slate-700 mb-1 mt-2; }
        .rich-content p { @apply text-xs sm:text-sm lg:text-base text-slate-600 mb-2 sm:mb-3 leading-relaxed; }
        .rich-content strong { @apply font-semibold text-slate-900; }
        .rich-content b { @apply font-bold text-slate-900; }
        .rich-content em { @apply italic; }
        .rich-content i { @apply italic; }
        .rich-content u { @apply underline; }
        .rich-content s { @apply line-through; }
        .rich-content del { @apply line-through; }
        .rich-content mark { @apply bg-yellow-200 px-1 rounded; }
        .rich-content small { @apply text-xs; }
        .rich-content sub { @apply text-xs align-sub; }
        .rich-content sup { @apply text-xs align-super; }
        .rich-content code { @apply bg-slate-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono text-slate-800; }
        .rich-content pre { @apply bg-slate-100 p-2 sm:p-4 rounded-lg text-xs sm:text-sm font-mono text-slate-800 overflow-x-auto mb-2 sm:mb-3; }
        .rich-content blockquote { @apply border-l-2 sm:border-l-4 border-blue-500 pl-2 sm:pl-4 italic text-slate-600 my-2 sm:my-4 text-xs sm:text-sm lg:text-base; }
        .rich-content ul { @apply list-disc list-inside mb-2 sm:mb-3 text-xs sm:text-sm lg:text-base text-slate-600 space-y-1; }
        .rich-content ol { @apply list-decimal list-inside mb-2 sm:mb-3 text-xs sm:text-sm lg:text-base text-slate-600 space-y-1; }
        .rich-content li { @apply mb-0.5 sm:mb-1; }
        .rich-content li ul, .rich-content li ol { @apply mt-1 ml-4 mb-1; }
        .rich-content a { @apply text-blue-600 hover:text-blue-800 underline break-words; }
        .rich-content img { @apply max-w-full h-auto rounded-lg my-2 sm:my-4; }
        .rich-content table { @apply w-full border-collapse border border-slate-300 my-2 sm:my-4 text-xs sm:text-sm; }
        .rich-content th { @apply border border-slate-300 px-2 sm:px-4 py-1 sm:py-2 bg-slate-100 font-semibold text-left; }
        .rich-content td { @apply border border-slate-300 px-2 sm:px-4 py-1 sm:py-2; }
        .rich-content hr { @apply border-t border-slate-300 my-3 sm:my-6; }
        .rich-content div { @apply text-xs sm:text-sm lg:text-base; }
        .rich-content span { @apply text-xs sm:text-sm lg:text-base; }
      `}</style>

      {/* Header section - keep in container */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
              <li className="flex items-center">
                <Home className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <Link href="/" className="ml-1 hover:text-blue-600 transition-colors truncate">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
              <li className="min-w-0">
                <Link href="/services" className="hover:text-blue-600 transition-colors truncate block">
                  Services
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
              <li className="min-w-0 max-w-[80px] sm:max-w-[120px] lg:max-w-none">
                <Link
                  href={`/services/${category}`}
                  className="hover:text-blue-600 transition-colors truncate block"
                  title={cat.name}
                >
                  {cat.name}
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
              <li className="min-w-0 max-w-[80px] sm:max-w-[120px] lg:max-w-none">
                <Link
                  href={`/services/${category}/${subcategory}`}
                  className="hover:text-blue-600 transition-colors truncate block"
                  title={sub.name}
                >
                  {sub.name}
                </Link>
              </li>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
              <li
                aria-current="page"
                className="text-slate-900 font-medium min-w-0 max-w-[100px] sm:max-w-[150px] lg:max-w-none"
              >
                <span className="truncate block" title={s.title}>
                  {s.title}
                </span>
              </li>
            </ol>
          </nav>

          <Link
            href={`/services/${category}/${subcategory}`}
            className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600 hover:text-blue-600 transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Back to {sub.name}</span>
          </Link>
        </div>
      </div>

      <div className="sm:max-w-4xl sm:mx-auto py-6 sm:py-8 lg:py-12">
        <article className="bg-white/80 backdrop-blur-sm border-0 sm:border border-slate-200 rounded-none sm:rounded-xl sm:rounded-2xl shadow-none sm:shadow-xl overflow-hidden mx-0 sm:mx-3 lg:mx-8">
          {/* Title section - full width on mobile */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0 border border-white/30">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight drop-shadow-sm">
                  {s.title}
                </h1>
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium border border-white/30">
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none" title={cat.name}>
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium border border-white/30">
                    <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none" title={sub.name}>
                      {sub.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary section - full width on mobile */}
          {s.summary && (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-3 sm:px-6 lg:px-8 py-3 sm:py-6 border-b border-slate-200/60">
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="w-1 sm:w-1.5 h-12 sm:h-20 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full flex-shrink-0 mt-1"></div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 mb-1 sm:mb-3">
                    Service Summary
                  </h2>
                  <div className="rich-content">
                    <div dangerouslySetInnerHTML={{ __html: s.summary }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price section - full width on mobile */}
          {s.priceRange && (
            <div className="bg-white px-3 sm:px-6 lg:px-8 py-3 sm:py-5 border-b border-slate-200/60">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 rounded-lg sm:rounded-2xl text-sm sm:text-base lg:text-lg font-semibold border border-green-200 shadow-sm">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>Price Range: {s.priceRange}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main content - reduced padding on mobile */}
          <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Gallery code */}
            {(() => {
              const gallery =
                s?.images && s.images.length
                  ? s.images
                  : ([sub?.image, ...(cat?.images || [])].filter(Boolean) as { url: string; publicId: string }[])
              return gallery.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                  {gallery.map((img) => (
                    <img
                      key={img.publicId ?? img.url}
                      src={img.url || "/placeholder.svg"}
                      alt={s!.title}
                      className="w-full h-32 sm:h-40 lg:h-44 object-cover rounded-lg sm:rounded-xl border"
                    />
                  ))}
                </div>
              ) : null
            })()}

            {/* Overview section - reduced spacing on mobile */}
            {s.description && (
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-0.5 sm:w-1 h-4 sm:h-5 lg:h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full flex-shrink-0"></div>
                  Overview
                </h2>
                <div className="rich-content bg-slate-50/50 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100">
                  <div dangerouslySetInnerHTML={{ __html: s.description }} />
                </div>
              </div>
            )}

            {/* Details section - reduced spacing on mobile */}
            {s.content && (
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-0.5 sm:w-1 h-4 sm:h-5 lg:h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full flex-shrink-0"></div>
                  Details
                </h2>
                <div className="rich-content">
                  <div dangerouslySetInnerHTML={{ __html: s.content }} />
                </div>
              </div>
            )}

            {/* Tags section - reduced mobile padding */}
            {s.tags?.length ? (
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
                  <div className="w-0.5 sm:w-1 h-4 sm:h-5 lg:h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full flex-shrink-0"></div>
                  Tags
                </h2>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {s.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* CTA section - reduced mobile padding */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-blue-100">
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">
                  Interested in this service?
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-3 sm:mb-4">
                  Get in touch with us to discuss your requirements and get a quote.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                  >
                    Get Quote
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-medium rounded-lg sm:rounded-xl bg-white hover:bg-blue-50 transition-all duration-200 text-sm sm:text-base"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related services and testimonials - reduced mobile spacing */}
        <div className="mt-6 sm:mt-10 lg:mt-12 px-3 sm:px-0">
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">
              More services in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {sub.name}
              </span>
            </h2>
            <div className="text-center">
              <Link
                href={`/services/${category}/${subcategory}`}
                className="inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-medium rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
              >
                <span className="truncate">View all {sub.name} services</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              </Link>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 lg:mt-16">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">
              Testimonials
            </h2>
            <div className="grid gap-3 sm:gap-4 lg:gap-6 md:grid-cols-2">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow"
                >
                  <div className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">{t.authorName}</div>
                  <p className="text-slate-700 text-xs sm:text-sm lg:text-base leading-relaxed">{t.message}</p>
                </div>
              ))}
              {testimonials.length === 0 && (
                <div className="text-center text-slate-500 text-xs sm:text-sm col-span-full">
                  No testimonials yet for this subcategory.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
