"use client"

import Image from "next/image";

const testimonials = [
    {
        quote: "The false ceiling design completely transformed our living room. The cove lighting adds such a premium feel. Highly professional team!",
        author: "Rahul Sharma",
        location: "Mumbai",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    },
    {
        quote: "Perfect execution of our office grid ceiling. They worked over the weekend to minimize disruption. Very satisfied with the Armstrong installation.",
        author: "Anita Desai",
        location: "Delhi",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    },
]

export function Testimonials() {
    return (
        <section className="py-12 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-8 items-center mb-10 lg:mb-16">
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                        Trusted by Homeowners <br /> & Businesses
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 lg:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-slate-100">
                            <div className="absolute top-4 right-6 lg:top-8 lg:right-10 text-slate-200 font-serif text-6xl lg:text-8xl opacity-50 font-bold">
                                &quot;
                            </div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <p className="text-base sm:text-lg lg:text-xl text-slate-700 leading-relaxed mb-6 lg:mb-8 font-medium">
                                    {t.quote}
                                </p>

                                <div className="flex items-center gap-4">
                                    <Image
                                        src={t.avatar}
                                        alt={t.author}
                                        width={56}
                                        height={56}
                                        className="rounded-full object-cover border-2 border-slate-100 w-10 h-10 lg:w-14 lg:h-14"
                                    />
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-base lg:text-lg">{t.author}</h4>
                                        <p className="text-slate-500 text-xs lg:text-sm">{t.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
