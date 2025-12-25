"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
    return (
        <div className="relative min-h-[85vh] flex items-center bg-white overflow-hidden pt-10 sm:pt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 lg:py-20">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Text Content */}
                    <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs sm:text-sm font-medium text-slate-600">Available across the city</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                                Perfect Ceiling & <br />
                                <span className="text-slate-900">
                                    Wall Solutions
                                </span>
                            </h1>
                            <p className="text-sm sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                                Transform your space with expert installation of False Ceilings, POP Wall Plastering, Armstrong Grid Systems, and premium Wooden accents.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center px-6 py-3 text-sm sm:text-base font-semibold text-white transition-all bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                            >
                                Get a Quote
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                            <Link
                                href="/services"
                                className="inline-flex items-center justify-center px-6 py-3 text-sm sm:text-base font-semibold text-slate-700 transition-all bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                            >
                                View Services
                            </Link>
                        </div>

                        <div className="pt-6 sm:pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {[
                                { label: "Projects Completed", value: "400+" },
                                { label: "Happy Clients", value: "600+" },
                                { label: "Years Experience", value: "10+" },
                            ].map((stat, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="text-xl sm:text-3xl font-bold text-slate-900">{stat.value}</div>
                                    <div className="text-xs sm:text-sm text-slate-500 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero Image - Simplified */}
                    <div className="relative h-[300px] sm:h-[400px] lg:h-[600px] w-full mt-8 lg:mt-0">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                            <Image
                                src="/images/home/hero.png"
                                alt="Modern False Ceiling Design"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
