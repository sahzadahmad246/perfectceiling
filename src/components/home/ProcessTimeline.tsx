"use client"

import { Rocket, Ruler, Hammer } from "lucide-react"
import Image from "next/image"

const steps = [
    {
        icon: Rocket,
        title: "Consultation",
        description: "We start by understanding your requirements, assessing the site, and suggesting the best false ceiling and wall designs.",
    },
    {
        icon: Ruler,
        title: "Design & Plan",
        description: "Our team creates precise measurements and design layouts, selecting the right materials (Gypsum, POP, Grid) for your space.",
    },
    {
        icon: Hammer,
        title: "Expert Installation",
        description: "Our skilled craftsmen execute the installation with minimal disruption, ensuring a clean, durable, and perfect finish.",
    },
]

export function ProcessTimeline() {
    return (
        <section className="py-12 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Content Side */}
                    <div>
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-8 lg:mb-12 leading-tight">
                            Simple 3-Step Process to Your Dream Space
                        </h2>

                        <div className="relative space-y-8 lg:space-y-12 pl-4">
                            {/* Vertical Line */}
                            <div className="absolute left-[20px] lg:left-[27px] top-4 bottom-4 w-px bg-slate-200" />

                            {steps.map((step, index) => (
                                <div key={index} className="relative flex gap-6 lg:gap-8 group">
                                    {/* Icon Bubble */}
                                    <div className="relative z-10 flex-shrink-0 w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-slate-900 flex items-center justify-center text-white ring-4 ring-white shadow-lg group-hover:bg-blue-600 transition-colors duration-300">
                                        <step.icon className="w-4 h-4 lg:w-6 lg:h-6" />
                                    </div>

                                    <div className="pt-1 lg:pt-2">
                                        <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 lg:mb-3">{step.title}</h3>
                                        <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Side */}
                    <div className="relative h-[300px] sm:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl mt-8 lg:mt-0">
                        <Image
                            src="/images/home/process.png"
                            alt="Planning and Design"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 text-white">
                            <p className="font-bold text-xl lg:text-2xl">Precision Planning</p>
                            <p className="text-xs lg:text-sm opacity-90">Blueprint to Reality</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
