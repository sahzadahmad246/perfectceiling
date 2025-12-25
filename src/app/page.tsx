import { Hero } from "@/components/home/Hero"
import ServicesGrid from "@/components/home/ServicesGrid"
import { FeatureSection } from "@/components/home/FeatureSection"
import { ProcessTimeline } from "@/components/home/ProcessTimeline"
import { Testimonials } from "@/components/home/Testimonials"
import { Newsletter } from "@/components/home/Newsletter"
import Link from "next/link"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Perfect Ceiling | Expert False Ceiling & POP Wall Plastering Solutions",
  description: "Transform your home and office with Perfect Ceiling. We specialize in modern Gypsum False Ceilings, POP Wall Punishing, Armstrong Grid Systems, and Wooden accents.",
  keywords: ["False Ceiling", "POP Plaster", "Armstrong Ceiling", "Wall Decor", "Interior Contractor", "Gypsum Design"],
  openGraph: {
    title: "Perfect Ceiling - Expert Wall & Ceiling Solutions",
    description: "Premium false ceiling and wall plastering services for homes and offices.",
    images: ["/images/home/hero.png"],
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <ServicesGrid />
      <FeatureSection />
      <ProcessTimeline />
      <Testimonials />
      <Newsletter />

      {/* Footer Section */}
      <footer className="bg-slate-950 pt-32 pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 lg:gap-8 mb-16 text-slate-400">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-white text-2xl font-bold mb-6">PerfectCeiling</h3>
              <p className="leading-relaxed mb-6">
                Your trusted partner for professional false ceiling and wall plastering services. Quality execution, every time.
              </p>
              <div className="flex gap-4">
                {/* Social Icons Placeholder */}
                <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Services</h4>
              <ul className="space-y-4">
                <li><Link href="/services/false-ceilings" className="hover:text-white transition-colors">False Ceilings</Link></li>
                <li><Link href="/services/pop-plaster" className="hover:text-white transition-colors">POP Wall Plaster</Link></li>
                <li><Link href="/services/grid-ceiling" className="hover:text-white transition-colors">Grid Systems</Link></li>
                <li><Link href="/services/wooden-ceiling" className="hover:text-white transition-colors">Wooden Design</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/projects" className="hover:text-white transition-colors">Our Projects</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Contact</h4>
              <ul className="space-y-4">
                <li><a href="mailto:info@perfectceiling.com" className="hover:text-white transition-colors">info@perfectceiling.com</a></li>
                <li>+91 98765 43210</li>
                <li>123, Interiors Lane, Cityville</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} PerfectCeiling. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
