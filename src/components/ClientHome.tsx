"use client"; // Mark as client component

import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

// HeroImages component
async function HeroImages() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/images`,
    {
      next: { revalidate: 60 },
    }
  );
  const data = res.ok ? await res.json() : { success: false, data: [] };
  const images = data.success && data.data ? data.data : [];

  return (
    <div className="grid grid-cols-2 gap-4 lg:gap-6">
      <div className="space-y-4 lg:space-y-6">
        {images[0] && (
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform rotate-2 hover:rotate-3 transition-transform duration-300">
            <Image
              src={images[0].url || "/placeholder.svg"}
              alt={images[0].publicId || "Ceiling design"}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {images[1] && (
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl transform -rotate-1 hover:-rotate-2 transition-transform duration-300">
            <Image
              src={images[1].url || "/placeholder.svg"}
              alt={images[1].publicId || "Ceiling design"}
              width={400}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="space-y-4 lg:space-y-6 pt-8 lg:pt-12">
        {images[2] && (
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl transform rotate-1 hover:rotate-2 transition-transform duration-300">
            <Image
              src={images[2].url || "/placeholder.svg"}
              alt={images[2].publicId || "Ceiling design"}
              width={400}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {images[3] && (
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xl transform -rotate-2 hover:-rotate-3 transition-transform duration-300">
            <Image
              src={images[3].url || "/placeholder.svg"}
              alt={images[3].publicId || "Ceiling design"}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface Testimonial {
  id: string;
  authorName: string;
  message: string;
}

interface Service {
  id: string;
  title: string;
  priceRange?: string;
  images?: Array<{ url: string }>;
}

// Testimonials component
async function Testimonials() {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_SITE_URL ?? ""
    }/api/testimonials?status=published`,
    {
      next: { revalidate: 60 },
    }
  );
  const items = res.ok ? await res.json() : [];

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 border ">
      {items.slice(0, 6).map((t: Testimonial, index: number) => (
        <div
          key={t.id}
          className={`relative group overflow-hidden ${
            index % 3 === 0
              ? "lg:rotate-1"
              : index % 3 === 1
              ? "lg:-rotate-1"
              : "lg:rotate-0"
          } hover:rotate-0 transition-all duration-700 `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 rounded-3xl opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-amber-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-amber-300/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
          <div
            className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-orange-200/30 to-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className=" relative bg-white/95 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-3 group-hover:scale-[1.02]">
            <div className="flex items-center mb-8">
              <div className="relative mr-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/30 via-primary/20 to-amber-200/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/90 to-white/70 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-xl mb-2 group-hover:text-primary transition-colors duration-300">
                  {t.authorName}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="relative">
                      <svg
                        className="w-5 h-5 text-amber-400 drop-shadow-sm"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    </div>
                  ))}
                  <span className="text-amber-600 text-sm font-bold ml-2 px-2 py-1 bg-amber-50 rounded-full">
                    5.0
                  </span>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Verified Customer
                </div>
              </div>
            </div>
            <div className="relative mb-8">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-primary/15 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.142 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
              </div>
              <blockquote className="text-slate-700 leading-relaxed text-lg pl-10 group-hover:text-slate-800 transition-colors duration-300 font-medium relative">
                <span className="relative z-10">{t.message}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </blockquote>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-amber-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between p-4 border-t border-gradient-to-r from-amber-200/30 to-primary/20">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-3 animate-pulse" />
                  <span className="text-sm text-slate-600 font-semibold">
                    Verified Review
                  </span>
                </div>
                <div className="flex items-center text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Recommended
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="col-span-full text-center py-20 border ">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 via-gray-50 to-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div className="text-gray-600 text-2xl font-bold mb-3">
            No testimonials yet.
          </div>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Be the first to share your experience with our amazing ceiling
            services!
          </p>
        </div>
      )}
    </div>
  );
}

// ServicesPreview component
async function ServicesPreview() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/services/list`,
    {
      next: { revalidate: 60 },
    }
  );
  const items = res.ok ? await res.json() : [];

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 6).map((s: Service, index: number) => (
        <Link key={s.id} href={`/services`} className="group block">
          <div
            className={`h-full relative overflow-hidden ${
              index % 3 === 0
                ? "lg:rotate-1"
                : index % 3 === 1
                ? "lg:-rotate-1"
                : "lg:rotate-0"
            } hover:rotate-0 transition-all duration-700`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/80 to-amber-50/60 rounded-3xl" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/8 via-transparent to-orange-100/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/20 to-amber-300/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
            <div
              className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-tr from-orange-200/30 to-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div className="relative bg-white/95 backdrop-blur-sm border border-white/60 rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-4 group-hover:scale-[1.03]">
              {s.images?.[0]?.url && (
                <div className="relative overflow-hidden h-64">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-20 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-amber-300/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <Image
                    src={s.images[0].url || "/placeholder.svg"}
                    alt={s.title}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                  />
                  <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg transform translate-x-12 group-hover:translate-x-0 transition-transform duration-500 border border-white/50">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-amber-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm font-bold text-slate-700">
                          Premium
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl px-4 py-2 shadow-lg transform translate-x-16 group-hover:translate-x-0 transition-transform duration-700 delay-100">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-white mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        <span className="text-sm font-bold text-white">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 transform translate-y-4 group-hover:translate-y-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-white font-bold bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Details
                      </div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <h3 className="font-bold text-foreground text-2xl mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                    {s.title}
                  </h3>
                  {s.priceRange && (
                    <div className="inline-flex items-center px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/15 to-amber-200/20 text-primary text-sm font-bold mb-6 shadow-lg border border-primary/30 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary/30 to-primary/20 rounded-full flex items-center justify-center mr-3">
                        <svg
                          className="w-3 h-3 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                      {s.priceRange}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors duration-300 font-bold text-lg">
                      <span>Explore Service</span>
                      <svg
                        className="w-6 h-6 ml-3 group-hover:translate-x-3 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary/40 group-hover:to-primary/30 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <svg
                        className="w-7 h-7 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {items.length === 0 && (
        <div className="col-span-full text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="text-gray-600 text-xl font-semibold mb-2">
            No services available yet.
          </div>
          <p className="text-gray-500">
            Check back soon for our amazing ceiling solutions!
          </p>
        </div>
      )}
    </div>
  );
}

// BusinessCta component
async function BusinessCta() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/business`,
    {
      next: { revalidate: 300 },
    }
  );
  const data = res.ok ? await res.json() : {};
  const phone = (data?.primaryPhone as string) || (data?.phone as string) || "";
  const digits = phone.replace(/[^0-9]/g, "");
  const waText = encodeURIComponent("Hello! I am interested in your services.");
  const waHref = digits ? `https://wa.me/${digits}?text=${waText}` : "#";
  const telHref = phone ? `tel:${phone}` : "#";
  const name = (data?.name as string) || "Perfect Ceiling";
  const address = (data?.address as string) || undefined;
  const email = (data?.email as string) || undefined;

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-amber-50/80 to-orange-100/60" />
      <div className="absolute inset-0">
        <div
          className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-amber-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-0 right-0 w-52 h-52 bg-gradient-to-tl from-orange-300/25 to-primary/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>
      <div className="relative p-8 sm:p-12 lg:p-16">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-5 items-center">
          <div className="lg:col-span-3 text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-bold mb-6 shadow-sm backdrop-blur-sm border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
              Free Consultation Available
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Ready to Transform Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-600 to-primary mt-2 animate-pulse">
                Dream Space?
              </span>
            </h2>
            <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Get a free consultation and personalized quote for your ceiling
              project. Our expert craftsmen are ready to bring your vision to
              life with precision and style.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href={telHref}
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg transform hover:-translate-y-1 hover:scale-105"
              >
                <svg
                  className="w-6 h-6 mr-3 group-hover:animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call Now - Free Quote
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-green-500 bg-white/80 text-green-600 hover:bg-green-50 hover:border-green-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg
                  className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                WhatsApp Chat
              </a>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-300/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/90 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7 text-primary"
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
                  </div>
                  <h3 className="font-bold text-foreground text-2xl">
                    Get In Touch
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="font-bold text-foreground text-xl">
                    {name}
                  </div>
                  {address && (
                    <div className="text-muted-foreground flex items-start group/item hover:text-foreground transition-colors">
                      <svg
                        className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-primary"
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
                      <span className="leading-relaxed">{address}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="text-muted-foreground flex items-center group/item hover:text-foreground transition-colors">
                      <svg
                        className="w-5 h-5 mr-3 flex-shrink-0 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <a
                        href={telHref}
                        className="text-primary hover:text-primary/80 transition-colors font-semibold text-lg group-hover/item:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  )}
                  {email && (
                    <div className="text-muted-foreground flex items-center group/item hover:text-foreground transition-colors">
                      <svg
                        className="w-5 h-5 mr-3 flex-shrink-0 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={`mailto:${email}`}
                        className="text-primary hover:text-primary/80 transition-colors font-semibold group-hover/item:underline"
                      >
                        {email}
                      </a>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href="/contact"
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-bold text-lg group/link"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      Contact Form
                      <svg
                        className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientHome() {
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
                <span className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
                ✨ Premium Ceiling Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                Transform Your Space with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-600 to-primary mt-2 animate-pulse">
                  Perfect Ceilings
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Expert craftsmanship meets modern design. From elegant
                installations to precision repairs, we create ceiling solutions
                that elevate your space to new heights.
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                Discover our most requested ceiling solutions, crafted with
                precision and attention to detail that exceeds expectations
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted rounded-2xl h-80 animate-pulse"
                    />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Contact CTA Section */}
          <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
            <Suspense
              fallback={
                <div className="bg-muted rounded-2xl h-48 animate-pulse" />
              }
            >
              <BusinessCta />
            </Suspense>
          </div>

          {/* Testimonials Section */}
          <div className="space-y-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
                Real experiences from satisfied customers who trusted us with
                their most important ceiling projects
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid gap-6 md:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted rounded-2xl h-40 animate-pulse border"
                    />
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
                © {new Date().getFullYear()} Perfect Ceiling. All rights
                reserved.
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
