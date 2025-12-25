"use server";
import { getPublishedTestimonials } from "@/lib/data";

interface Testimonial {
    id: string;
    authorName: string;
    message: string;
}

export async function Testimonials() {
    const items = await getPublishedTestimonials();

    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 ">
            {items.slice(0, 6).map((t: Testimonial, index: number) => (
                <div
                    key={t.id}
                    className={`relative group overflow-hidden ${index % 3 === 0 ? "lg:rotate-1" : index % 3 === 1 ? "lg:-rotate-1" : "lg:rotate-0"
                        } hover:rotate-0 transition-all duration-700  rounded-3xl`}
                >
                    {/* Animated background gradient */}
                    <div className=" absolute inset-0 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 rounded-3xl opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className=" absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-amber-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Floating orbs */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-amber-300/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                    <div
                        className=" absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-tr from-orange-200/30 to-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"
                        style={{ animationDelay: "1s" }}
                    />

                    <div className="  relative bg-white/95 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-3 group-hover:scale-[1.02]">
                        {/* Premium header with enhanced avatar */}
                        <div className="flex items-center mb-8">
                            <div className="relative mr-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary/30 via-primary/20 to-amber-200/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                    <div className="w-16 h-16 bg-gradient-to-br from-white/90 to-white/70 rounded-xl flex items-center justify-center">
                                        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                </div>
                                {/* Verified badge */}
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
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
                                            <svg className="w-5 h-5 text-amber-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                        </div>
                                    ))}
                                    <span className="text-amber-600 text-sm font-bold ml-2 px-2 py-1 bg-amber-50 rounded-full">5.0</span>
                                </div>
                                <div className="text-sm text-slate-500 font-medium">Verified Customer</div>
                            </div>
                        </div>

                        {/* Enhanced quote with premium styling */}
                        <div className="relative mb-8">
                            <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-primary/15 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.142 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                                </svg>
                            </div>
                            <blockquote className="text-slate-700 leading-relaxed text-lg pl-10 group-hover:text-slate-800 transition-colors duration-300 font-medium relative">
                                <span className="relative z-10">{t.message}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </blockquote>
                        </div>

                        {/* Premium footer with enhanced elements */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-amber-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative flex items-center justify-between p-4 border-t border-gradient-to-r from-amber-200/30 to-primary/20">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-3 animate-pulse" />
                                    <span className="text-sm text-slate-600 font-semibold">Verified Review</span>
                                </div>
                                <div className="flex items-center text-primary text-sm font-bold bg-primary/10 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="col-span-full text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 via-gray-50 to-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <div className="text-gray-600 text-2xl font-bold mb-3">No testimonials yet.</div>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                        Be the first to share your experience with our amazing ceiling services!
                    </p>
                </div>
            )}
        </div>
    );
}
