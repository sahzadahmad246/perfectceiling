"use server";
import Link from "next/link";
import Image from "next/image";
import { getServiceList } from "@/lib/data";

interface Service {
    id: string;
    title: string;
    priceRange?: string;
    images?: Array<{ url: string }>;
}

export async function ServicesPreview() {
    const items = await getServiceList();

    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 6).map((s: Service, index: number) => (
                <Link key={s.id} href={`/services`} className="group block">
                    <div
                        className={`h-full relative overflow-hidden ${index % 3 === 0 ? "lg:rotate-1" : index % 3 === 1 ? "lg:-rotate-1" : "lg:rotate-0"
                            } hover:rotate-0 transition-all duration-700 rounded-3xl `}
                    >
                        {/* Animated background layers */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/80 to-amber-50/60 rounded-3xl" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/8 via-transparent to-orange-100/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Floating elements */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/20 to-amber-300/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                        <div
                            className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-tr from-orange-200/30 to-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"
                            style={{ animationDelay: "1s" }}
                        />

                        <div className="  relative bg-white/95 backdrop-blur-sm border border-white/60 rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-4 group-hover:scale-[1.03]">
                            {/* Premium image section with advanced effects */}
                            {s.images?.[0]?.url && (
                                <div className="relative overflow-hidden h-64">
                                    {/* Image overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-20 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-amber-300/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <Image
                                        src={s.images[0].url || "/placeholder.svg"}
                                        alt={s.title}
                                        width={400}
                                        height={256}
                                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                                    />

                                    {/* Premium floating badges */}
                                    <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
                                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg transform translate-x-12 group-hover:translate-x-0 transition-transform duration-500 border border-white/50">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                                <span className="text-sm font-bold text-slate-700">Premium</span>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl px-4 py-2 shadow-lg transform translate-x-16 group-hover:translate-x-0 transition-transform duration-700 delay-100">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 text-white mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                                <span className="text-sm font-bold text-white">Available</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced overlay content */}
                                    <div className="absolute bottom-6 left-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 transform translate-y-4 group-hover:translate-y-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-white font-bold bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Premium content section */}
                            <div className="p-8 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative">
                                    <h3 className="font-bold text-foreground text-2xl mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                                        {s.title}
                                    </h3>

                                    {s.priceRange && (
                                        <div className="inline-flex items-center px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/15 to-amber-200/20 text-primary text-sm font-bold mb-6 shadow-lg border border-primary/30 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                                            <div className="w-6 h-6 bg-gradient-to-br from-primary/30 to-primary/20 rounded-full flex items-center justify-center mr-3">
                                                <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary/40 group-hover:to-primary/30 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                                            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                    </div>
                    <div className="text-gray-600 text-xl font-semibold mb-2">No services available yet.</div>
                    <p className="text-gray-500">Check back soon for our amazing ceiling solutions!</p>
                </div>
            )}
        </div>
    );
}
