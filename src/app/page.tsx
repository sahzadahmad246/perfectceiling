import Link from "next/link"
import { Suspense } from "react"

async function Testimonials() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/testimonials?status=published`, {
    next: { revalidate: 60 },
  })
  const items: Array<{ id: string; authorName: string; message: string }> = res.ok ? await res.json() : []
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.slice(0, 6).map((t) => (
        <div key={t.id} className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="font-semibold text-slate-900">{t.authorName}</div>
          <p className="text-slate-700 mt-1">{t.message}</p>
        </div>
      ))}
      {items.length === 0 && <div className="text-slate-500">No testimonials yet.</div>}
    </div>
  )
}

async function ServicesPreview() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/services/list`, { next: { revalidate: 60 } })
  const items: Array<{
    id: string
    title: string
    slug: string
    priceRange?: string
    images?: { url: string }[]
    categoryId: string
    subcategoryId: string
  }> = res.ok ? await res.json() : []

  return (
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 6).map((s) => (
        <Link key={s.id} href={`/services`} className="group block">
          <div className="h-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            {s.images?.[0]?.url && (
              <div className="relative overflow-hidden">
                <img
                  src={s.images[0].url || "/placeholder.svg"}
                  alt={s.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}
            <div className="p-6">
              <h3 className="font-semibold text-foreground text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {s.title}
              </h3>
              {s.priceRange && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                  {s.priceRange}
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Learn more
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {items.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-muted-foreground">No services available yet.</div>
        </div>
      )}
    </div>
  )
}

async function BusinessCta() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/business`, { next: { revalidate: 300 } })
  const data = res.ok ? await res.json() : {}
  const phone: string = (data?.primaryPhone as string) || (data?.phone as string) || ""
  const digits = phone.replace(/[^0-9]/g, "")
  const waText = encodeURIComponent("Hello! I am interested in your services.")
  const waHref = digits ? `https://wa.me/${digits}?text=${waText}` : "#"
  const telHref = phone ? `tel:${phone}` : "#"
  const name: string = (data?.name as string) || "Perfect Ceiling"
  const address: string | undefined = (data?.address as string) || undefined
  const email: string | undefined = (data?.email as string) || undefined

  return (
    <div className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/15 rounded-full blur-3xl" />
      </div>

      <div className="relative grid gap-8 lg:gap-12 lg:grid-cols-5 items-center">
        {/* Main CTA */}
        <div className="lg:col-span-3 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Get a free consultation and quote for your ceiling project. Our experts are ready to help bring your vision
            to life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <a
              href={telHref}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call Now
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all duration-200 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground text-lg">Get In Touch</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="font-medium text-foreground">{name}</div>
              {address && (
                <div className="text-muted-foreground flex items-start">
                  <svg
                    className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {address}
                </div>
              )}
              {phone && (
                <div className="text-muted-foreground flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a href={telHref} className="text-primary hover:text-primary/80 transition-colors">
                    {phone}
                  </a>
                </div>
              )}
              {email && (
                <div className="text-muted-foreground flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a href={`mailto:${email}`} className="text-primary hover:text-primary/80 transition-colors">
                    {email}
                  </a>
                </div>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium mt-2"
              >
                Contact Form
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent transform rotate-12"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-orange-200/20 to-transparent transform -rotate-12"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                ✨ Premium Ceiling Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Transform Your Space with
                <span className="block text-primary mt-2">Perfect Ceilings</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Expert craftsmanship meets modern design. From elegant installations to precision repairs, we create
                ceiling solutions that elevate your space.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/services"
                  className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Explore Our Services
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-4 text-base font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  Get Free Estimate
                </Link>
              </div>
            </div>

            {/* Hero Images Grid */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4 lg:space-y-6">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform rotate-2 hover:rotate-3 transition-transform duration-300">
                  <img
                    src="/modern-led-ceiling.png"
                    alt="Modern LED ceiling installation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl transform -rotate-1 hover:-rotate-2 transition-transform duration-300">
                  <img
                    src="/elegant-coffered-ceiling.png"
                    alt="Elegant coffered ceiling design"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 lg:space-y-6 pt-8 lg:pt-12">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl transform rotate-1 hover:rotate-2 transition-transform duration-300">
                  <img
                    src="/suspended-ceiling-recessed-lights.png"
                    alt="Suspended ceiling with recessed lighting"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform -rotate-2 hover:-rotate-3 transition-transform duration-300">
                  <img
                    src="/placeholder-5hl0b.png"
                    alt="Decorative ceiling molding"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20">
          {/* Services Section */}
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Popular Services</h2>
              <p className="text-lg text-muted-foreground">
                Discover our most requested ceiling solutions, crafted with precision and attention to detail
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-muted rounded-2xl h-80 animate-pulse" />
                  ))}
                </div>
              }
            >
              <ServicesPreview />
            </Suspense>
            <div className="text-center">
              <Link
                href="/services"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                View All Services
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Contact CTA Section */}
          <div className="bg-card rounded-3xl p-8 sm:p-12">
            <Suspense fallback={<div className="bg-muted rounded-2xl h-48 animate-pulse" />}>
              <BusinessCta />
            </Suspense>
          </div>

          {/* Testimonials Section */}
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What Our Clients Say</h2>
              <p className="text-lg text-muted-foreground">
                Real experiences from satisfied customers who trusted us with their ceiling projects
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid gap-6 md:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-muted rounded-2xl h-40 animate-pulse" />
                  ))}
                </div>
              }
            >
              <Testimonials />
            </Suspense>
          </div>
        </div>

        <footer className="bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="text-muted-foreground">
                © {new Date().getFullYear()} Perfect Ceiling. All rights reserved.
              </div>
              <div className="flex flex-wrap gap-6">
                <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">
                  Services
                </Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
