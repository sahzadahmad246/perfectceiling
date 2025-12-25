import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Perfect Ceiling Admin",
  description: "Admin dashboard for Perfect Ceiling business management.",
}

import { DashboardPageWrapper } from "@/components/admin/DashboardPageWrapper"
import { Users, FileText, CheckSquare, Briefcase } from "lucide-react"

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Quotes", value: "24", icon: FileText, color: "bg-blue-500" },
    { label: "Active Services", value: "8", icon: Briefcase, color: "bg-indigo-500" },
    { label: "Testimonials", value: "12", icon: Users, color: "bg-purple-500" },
    { label: "Pending Tasks", value: "3", icon: CheckSquare, color: "bg-orange-500" },
  ]

  return (
    <DashboardPageWrapper title="Dashboard" showBack={false}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg shadow-blue-500/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for Recent Activity/Charts */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 min-h-[400px]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
            <div className="flex items-center justify-center h-full text-slate-400">
              Chart Placeholder
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 min-h-[400px]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex items-center justify-center h-full text-slate-400">
              Actions Placeholder
            </div>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  )
}
