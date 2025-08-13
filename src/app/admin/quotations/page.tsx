import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quotations | Perfect Ceiling Admin",
  description: "Manage customer quotations and requests.",
}

export default function AdminQuotationsPage() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600 mt-2">Manage customer quotations and requests</p>
        </div>

        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">Quotations management coming soon...</p>
        </div>
      </div>
    </div>
  )
}
