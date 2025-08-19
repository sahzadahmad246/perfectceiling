"use client"

import Link from "next/link"
/* eslint-disable @next/next/no-img-element */
import type { CategoryDTO, SubcategoryDTO, ServiceDTO } from "@/types/services"
import { Briefcase, Tag, ArrowRight, Home, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function ServicesClientPage() {
  const [services, setServices] = useState<ServiceDTO[]>([])
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryDTO[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const servicesData = await fetch("/api/services/list").then((res) => res.json())
      const categoriesData = await fetch("/api/services/categories").then((res) => res.json())
      const subcategoriesData = await fetch("/api/services/subcategories").then((res) => res.json())

      setServices(servicesData)
      setCategories(categoriesData)
      setSubcategories(subcategoriesData)
    }

    fetchData()
  }, [])

  // Create lookup maps for efficient category/subcategory name resolution
  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const subcategoryMap = new Map(subcategories.map((s) => [s.id, s]))

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

      {/* Header Section */}
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
              <li aria-current="page" className="text-slate-900 font-medium">
                Services
              </li>
            </ol>
          </nav>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3 sm:mb-4">
              Our Services
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto px-2">
              Discover our comprehensive range of professional services designed to meet your needs with excellence and
              precision.
            </p>
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500">
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{services.length} Services Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 px-1">
            Browse Services by Categories
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const categoryServices = services.filter((s) => s.categoryId === category.id)
              return (
                <Link href={`/services/${category.slug}`} key={category.id} className="group block">
                  <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:scale-[1.02] hover:bg-white/90">
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                      {Array.isArray(category.images) && category.images.length > 0 ? (
                        <img
                          src={category.images[0].url || "/placeholder.svg"}
                          alt={category.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center flex-shrink-0">
                          <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-500">{categoryServices.length} services</p>
                      </div>
                    </div>
                    
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-8 sm:pb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 px-1">All Services</h2>
        <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const serviceId = service.id
            const category = categoryMap.get(service.categoryId)
            const subcategory = subcategoryMap.get(service.subcategoryId)
            const imageUrl = service.images?.[0]?.url || subcategory?.image?.url || category?.images?.[0]?.url

            return (
              <Link
                href={`/services/${category?.slug}/${subcategory?.slug}/${service.slug}`}
                key={serviceId}
                className="group block"
              >
                <div className="h-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 hover:bg-white/95">
                  {imageUrl && (
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={service.title}
                      className="w-full h-28 sm:h-32 lg:h-40 object-cover"
                    />
                  )}
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                          {service.title}
                        </h3>
                        {service.priceRange && (
                          <p className="text-xs sm:text-sm font-medium text-blue-600 mt-1">{service.priceRange}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {category && (
                        <Link
                          href={`/services/${category.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-colors"
                        >
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                          <span className="truncate max-w-20 sm:max-w-none">{category.name}</span>
                        </Link>
                      )}
                      {subcategory && (
                        <Link
                          href={`/services/${category?.slug}/${subcategory.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 hover:border-blue-300 transition-colors"
                        >
                          <span className="truncate max-w-24 sm:max-w-none">{subcategory.name}</span>
                        </Link>
                      )}
                    </div>

                   

                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
                      <span className="text-xs sm:text-sm text-slate-500 font-medium">Learn more</span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No services available</h3>
            <p className="text-sm sm:text-base text-slate-500">Check back later for new services.</p>
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
            name: "Services",
            description: "Comprehensive range of professional services",
            hasPart: services.map((service) => ({
              "@type": "Service",
              name: service.title,
              description: service.summary || service.description,
              url: `/services/${categoryMap.get(service.categoryId)?.slug}/${subcategoryMap.get(service.subcategoryId)?.slug}/${service.slug}`,
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
