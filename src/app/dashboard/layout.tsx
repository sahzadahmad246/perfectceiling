"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import './../../app/globals.css'
import {
  FileText,
  Settings,
  Star,
  FileCheck,
  Home,
  LogOut,
  Users,
  LayoutDashboard,
  Shield,
  Database,
  MoreHorizontal,
} from "lucide-react"
import { useState } from "react"

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/dashboard/quotations",
    label: "Quotations",
    icon: FileText,
  },
  {
    href: "/dashboard/services",
    label: "Services",
    icon: FileCheck,
  },
  {
    href: "/dashboard/testimonials",
    label: "Testimonials",
    icon: Star,
  },
  {
    href: "/dashboard/terms",
    label: "Terms",
    icon: FileText,
  },
  {
    href: "/dashboard/security",
    label: "Security",
    icon: Shield,
  },
  {
    href: "/dashboard/database",
    label: "Database",
    icon: Database,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
]

function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="font-bold text-xl text-black">
          Admin Dashboard
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 text-black hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start bg-white border-gray-300 text-black hover:bg-gray-100"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Site
          </Button>
        </Link>
        <form action="/api/auth/signout" method="post">
          <Button
            variant="outline"
            size="sm"
            type="submit"
            className="w-full justify-start bg-white border-gray-300 text-black hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}

function MobileBottomNav() {
  const [showMore, setShowMore] = useState(false)

  // First 4 items for bottom nav
  const primaryItems = navigationItems.slice(0, 4)
  // Remaining items for "More" section
  const moreItems = navigationItems.slice(4)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 sm:px-4 py-2 sm:py-3 z-50 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-1 sm:px-2 py-1 text-black hover:bg-gray-100 rounded-lg transition-colors min-w-0"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center gap-1 px-1 sm:px-2 py-1 text-black hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Items Sheet */}
      <Sheet open={showMore} onOpenChange={setShowMore}>
        <SheetContent side="bottom" className="h-[60vh] bg-white border-gray-200">
          <div className="flex flex-col space-y-4 mt-4">
            <h2 className="font-bold text-lg text-black mb-4">More Options</h2>

            <nav className="flex flex-col space-y-2 overflow-y-auto flex-1">
              {moreItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-3 px-3 py-3 text-black hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
              <Link href="/" onClick={() => setShowMore(false)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-white border-gray-300 text-black hover:bg-gray-100"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <form action="/api/auth/signout" method="post">
                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  className="w-full justify-start bg-white border-gray-300 text-black hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function MobileHeader() {
  return (
    <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sm:py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-base sm:text-lg text-black">
          Admin Dashboard
        </Link>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <DesktopSidebar />

        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <MobileHeader />

          <main className="flex-1 p-0 pb-20 md:pb-0">{children}</main>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  )
}
