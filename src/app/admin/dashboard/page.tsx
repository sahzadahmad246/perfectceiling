import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Perfect Ceiling Admin",
  description: "Admin dashboard for Perfect Ceiling business management.",
}

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 border border-red-500 m-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">Total Quotes</h3>
            <p className="text-3xl font-bold">24</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">Active Services</h3>
            <p className="text-3xl font-bold">8</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">Testimonials</h3>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">Pending Tasks</h3>
            <p className="text-3xl font-bold">3</p>
          </div>
        </div>
      </div>
    </div>
  )
}
