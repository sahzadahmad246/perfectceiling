"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  MessageSquare,
  Settings,
  Home,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const adminNavItems = [
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
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const avatarUrl = session?.user?.image || "/admin-avatar.png";

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      <ScrollArea className="flex-1 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="flex flex-col pt-5 pb-4">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">PC</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  Perfect Ceiling
                </h2>
                <p className="text-sm text-purple-600 font-medium truncate">
                  Admin Panel
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-2">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-purple-600"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          <Separator className="mx-3 my-4" />

          {/* Back to Home */}
          <div className="px-3 mb-4">
            <Link
              href="/"
              className="group flex items-center px-3 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              <Home className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              <span className="truncate">Back to Home</span>
            </Link>
          </div>

          {/* User Profile */}
          <div className="flex-shrink-0 px-3 space-y-3">
            {status === "loading" ? (
              <div className="flex items-center p-3 bg-gray-50 rounded-xl animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ) : session?.user ? (
              <>
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <Image
                    src={avatarUrl || "/placeholder.svg"}
                    alt="Admin avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {session.user.name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-medium">?</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    Not signed in
                  </p>
                  <p className="text-xs text-gray-500">
                    Please sign in to continue
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
