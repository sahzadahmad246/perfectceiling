"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import AdminSidebar from "./AdminSidebar"
import AdminMobileNav from "./AdminMobileNav"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Navigation */}
      <AdminMobileNav />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="pb-20 lg:pb-0">{children}</main>
      </div>
    </div>
  )
}
