import Link from "next/link";
import { Suspense } from "react";
import { HeroImages } from "@/components/home/HeroImages";
import { Testimonials } from "@/components/home/Testimonials";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { BusinessCta } from "@/components/home/BusinessCta";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/90 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent transform rotate-12 animate-pulse"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute inset-0 bg-gradient-to-l from-transparent via-orange-200/25 to-transparent transform -rotate-12 animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "1s" }}
          ></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-300/15 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary/15 to-primary/10 text-primary text-sm font-bold mb-8 shadow-lg backdrop-blur-sm border border-primary/20">
                <span className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>✨ Premium Ceiling Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                Transform Your Space with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-600 to-primary mt-2 animate-pulse">
                  Perfect Ceilings
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Expert craftsmanship meets modern design. From elegant installations to precision repairs, we create
                ceiling solutions that elevate your space to new heights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <Link
                  href="/services"
                  className="group w-full sm:w-auto px-10 py-5 text-lg font-bold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-2xl hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    Explore Our Services
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="group w-full sm:w-auto px-10 py-5 text-lg font-bold border-2 border-primary bg-white/80 text-primary rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
                >
                  Get Free Estimate
                </Link>
              </div>
            </div>

            {/* Hero Images Grid */}
            <Suspense
              fallback={
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-4 lg:space-y-6">
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-xl bg-muted animate-pulse" />
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-muted animate-pulse" />
                  </div>
                  <div className="space-y-4 lg:space-y-6 pt-8 lg:pt-12">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-muted animate-pulse" />
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-xl bg-muted animate-pulse" />
                  </div>
                </div>
              }
            >
              <HeroImages />
            </Suspense>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-24">
          {/* Services Section */}
          <div className="space-y-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Our Expertise
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                Our Popular
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600 mt-2">
                  Services
                </span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Discover our most requested ceiling solutions, crafted with precision and attention to detail that
                exceeds expectations
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 ">
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
                className="group inline-flex items-center px-8 py-4 text-lg font-bold text-primary hover:text-primary/80 transition-colors bg-white/80 rounded-2xl shadow-lg hover:shadow-xl backdrop-blur-sm border border-primary/20"
              >
                View All Services
                <svg
                  className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform"
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
          <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
            <Suspense fallback={<div className="bg-muted rounded-2xl h-48 animate-pulse" />}>
              <BusinessCta />
            </Suspense>
          </div>

          {/* Testimonials Section */}
          <div className="space-y-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Client Stories
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                What Our
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600 mt-2">
                  Clients Say
                </span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Real experiences from satisfied customers who trusted us with their most important ceiling projects
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

        <footer className="bg-gradient-to-r from-card/90 to-card/80 backdrop-blur-sm border-t border-border/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="text-muted-foreground text-lg">
                © {new Date().getFullYear()} Perfect Ceiling. All rights reserved.
              </div>
              <div className="flex flex-wrap gap-8">
                <Link
                  href="/services"
                  className="text-muted-foreground hover:text-primary transition-colors font-semibold text-lg"
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors font-semibold text-lg"
                >
                  Contact
                </Link>
                <Link
                  href="/profile"
                  className="text-muted-foreground hover:text-primary transition-colors font-semibold text-lg"
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
