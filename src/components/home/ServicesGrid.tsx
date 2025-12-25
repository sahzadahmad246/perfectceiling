"use client"

import { Grid, Hammer, Layers, LayoutGrid, PaintBucket, Ruler } from "lucide-react"
import Image from "next/image"

export default function ServicesGrid() {
    const services = [
        {
            title: "False Ceilings",
            description: "Modern gypsum false ceilings with cove lighting, intricate designs, and flawless finishing.",
            icon: <Layers className="w-8 h-8 text-blue-600" />,
            image: "/images/home/hero.png", // Reusing hero image or generate specific if needed, let's use hero for now or generic pattern
        },
        {
            title: "POP Wall Plastering",
            description: "High-quality Plaster of Paris (POP) wall punning and molding for smooth, paint-ready surfaces.",
            icon: <PaintBucket className="w-8 h-8 text-indigo-600" />,
            image: "/images/home/service_pop.png",
        },
        {
            title: "Armstrong Grid Matrix",
            description: "Durable and functional grid ceiling systems perfect for offices, hospitals, and commercial spaces.",
            icon: <LayoutGrid className="w-8 h-8 text-cyan-600" />,
            image: "/images/home/service_armstrong.png",
        },
        {
            title: "Wooden Ceilings",
            description: "Elegant wooden slat and panel ceilings that add warmth and sophistication to any room.",
            icon: <Hammer className="w-8 h-8 text-amber-700" />,
            image: "/images/home/service_wooden.png",
        },
        {
            title: "PVC Wall Panels",
            description: "Waterproof and stylish PVC wall paneling solutions for damp areas and decorative walls.",
            icon: <Grid className="w-8 h-8 text-emerald-600" />,
            image: "/images/home/service_pop.png", // Reuse pop or generic
        },
        {
            title: "Commercial Contracting",
            description: "End-to-end ceiling and wall solutions for large scale commercial and industrial projects.",
            icon: <Ruler className="w-8 h-8 text-slate-700" />,
            image: "/images/home/service_armstrong.png", // Reuse armstrong
        },
    ]

    return (
        <div className="py-12 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-16">
                    <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3 lg:mb-4">Our Expertise</h2>
                    <p className="text-base lg:text-lg text-slate-600">
                        We specialize in premium ceiling and wall solutions, delivering durability and aesthetics in every project.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group bg-slate-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100"
                        >
                            <div className="h-40 sm:h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors z-10"></div>
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-6 lg:p-8">
                                <div className="mb-4 bg-white w-10 h-10 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    {service.icon}
                                </div>
                                <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                                <p className="text-sm lg:text-base text-slate-600 leading-relaxed">{service.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
