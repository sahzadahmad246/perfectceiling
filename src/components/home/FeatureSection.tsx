"use client"

import { Plus, Minus } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"

const features = [
    {
        title: "False Ceiling & POP Specialists",
        content: "Our core expertise lies in creating stunning false ceilings and flawless POP wall finishes. We use premium gypsum and POP materials to ensure durability and aesthetic appeal.",
    },
    {
        title: "Commercial & Office Solutions",
        content: "We provide robust acoustic solutions like Armstrong grid ceilings for offices, ensuring a professional look and sound management.",
    },
]

export function FeatureSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Image Side */}
                    <div className="order-2 lg:order-1 relative">
                        <div className="relative h-[300px] sm:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/home/feature.png"
                                alt="Expert Craftsmanship"
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                        {/* Decorative Box - Adjusted or Removed for mobile safety */}
                        <div className="hidden lg:block absolute -bottom-10 -right-10 w-64 h-64 bg-slate-200 rounded-full blur-3xl opacity-50 -z-10" />
                    </div>

                    {/* Content Side */}
                    <div className="order-1 lg:order-2">
                        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-900 mb-4 lg:mb-6 leading-tight">
                            Precision in Every Corner
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base lg:text-lg mb-8 lg:mb-12 leading-relaxed">
                            We don&apos;t just renovations; we craft environments. From the crisp lines of a false ceiling to the smooth texture of a POP wall, our attention to detail makes the difference between good and perfect.
                        </p>

                        <div className="space-y-4 lg:space-y-6">
                            {features.map((feature, index) => (
                                <div key={index} className="border-b border-slate-200 pb-4 lg:pb-6">
                                    <button
                                        onClick={() => setOpenIndex(index === openIndex ? null : index)}
                                        className="w-full flex items-center justify-between text-left group"
                                    >
                                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <span className="ml-4 flex-shrink-0">
                                            {openIndex === index ? (
                                                <Minus className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                                            ) : (
                                                <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 group-hover:text-blue-600" />
                                            )}
                                        </span>
                                    </button>
                                    <div
                                        className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? "grid-rows-[1fr] opacity-100 mt-2 lg:mt-4" : "grid-rows-[0fr] opacity-0"
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                                {feature.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 lg:mt-12">
                            <Link
                                href="/services"
                                className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm sm:text-base font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all rounded-full hover:shadow-lg hover:-translate-y-1"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
