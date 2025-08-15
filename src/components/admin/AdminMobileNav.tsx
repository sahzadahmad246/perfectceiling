"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, FileText, Home, MoreHorizontal, Wrench, MessageSquare, Settings } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const mainNavItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Quotations",
    href: "/admin/quotations",
    icon: FileText,
  },
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
]

const moreNavItems = [
  {
    name: "Services",
    href: "/admin/services",
    icon: Wrench,
  },
  {
    name: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminMobileNav() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around py-2 px-2">
        {/* Main Navigation Items */}
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          )
        })}

        {/* More Menu */}
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 min-w-0 flex-1">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">More Options</h3>
             
            </div>
            <div className="space-y-2 pb-4">
              {moreNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-full ${
                      isActive ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-500"}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              <Link
                href="/"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 w-full"
              >
                <Home className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
