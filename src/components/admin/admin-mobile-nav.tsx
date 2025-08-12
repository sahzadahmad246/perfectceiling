"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  FileText,
  Settings,
  Star,
  FileCheck,
  Home,
  LogOut,
  Users,
  BarChart3,
  Shield,
  Database,
  MoreHorizontal,
} from "lucide-react"

const navigationItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/quotations",
    label: "Quotations",
    icon: FileText,
  },
  {
    href: "/admin/services",
    label: "Services",
    icon: FileCheck,
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: Star,
  },
  {
    href: "/admin/terms",
    label: "Terms",
    icon: FileText,
  },
  {
    href: "/admin/security",
    label: "Security",
    icon: Shield,
  },
  {
    href: "/admin/database",
    label: "Database",
    icon: Database,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
]

// First 4 items for bottom nav, rest in "More" sheet
const primaryNavItems = navigationItems.slice(0, 4)
const moreNavItems = navigationItems.slice(4)

export function AdminMobileNav() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0",
                  isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Link>
            )
          })}

          {/* More Button */}
          <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <MoreHorizontal className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">More Options</h2>
                </div>

                <nav className="flex-1 space-y-2">
                  {moreNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>

                <div className="border-t pt-4 space-y-2">
                  <Link href="/" onClick={() => setIsMoreOpen(false)}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Home className="w-4 h-4 mr-3" />
                      Back to Site
                    </Button>
                  </Link>
                  <form action="/api/auth/signout" method="post">
                    <Button
                      variant="outline"
                      type="submit"
                      className="w-full justify-start text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 bg-transparent"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </Button>
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind bottom nav */}
      <div className="lg:hidden h-20" />
    </>
  )
}
