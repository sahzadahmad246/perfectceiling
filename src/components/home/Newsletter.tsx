"use client"

import { Mail } from "lucide-react"

export function Newsletter() {
    return (
        <section className="px-4 sm:px-6 lg:px-8 relative z-10 -mb-20">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-center border border-slate-100">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                    Subscribe to Our Newsletter <br /> for Design Insights
                </h2>
                <p className="text-slate-600 mb-10 max-w-2xl mx-auto text-lg">
                    Be the first to discover trends, inspirations, and special offers as we bring the world of design directly to your inbox
                </p>

                <form className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-slate-900/20 outline-none transition-all placeholder:text-slate-400"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-8 py-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    )
}
