import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Testimonials | Perfect Ceiling Admin",
  description: "Manage customer testimonials and reviews.",
}

export default function AdminTestimonialsPage() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-2">Manage customer testimonials and reviews</p>
        </div>

        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">Testimonials management coming soon...</p>
        </div>
      </div>
    </div>
  )
}
