"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Home, Wrench, User, LogOut, Phone, FileText, Sparkles } from "lucide-react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false)

  const avatarUrl = session?.user?.image || "/next.svg"

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Perfect Ceiling
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="/services"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
              >
                <Wrench className="w-4 h-4" />
                Services
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
              >
                <Phone className="w-4 h-4" />
                Contact
              </Link>
              {session?.user?.role === "admin" && (
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
                >
                  <Wrench className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/quote"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                Get Quote
              </Link>
            </div>
          </div>

          <div className="hidden sm:block">
            {status !== "authenticated" ? (
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <Image
                    src={avatarUrl || "/placeholder.svg"}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View profile</p>
                  </div>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden backdrop-blur-sm">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                      onClick={() => setOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400"
                      onClick={() => {
                        setOpen(false)
                        signOut()
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <div className="flex items-center justify-around py-1">
          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 min-w-0 flex-1"
          >
            <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Home</span>
          </Link>

          {/* Services */}
          <Link
            href="/services"
            className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 min-w-0 flex-1"
          >
            <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Services</span>
          </Link>

          <Link
            href="/quote"
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 min-w-0 flex-1 mx-1"
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs font-medium">Quote</span>
          </Link>

          {/* Profile */}
          {status !== "authenticated" ? (
            <button
              onClick={() => signIn("google")}
              className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 min-w-0 flex-1"
            >
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Login</span>
            </button>
          ) : (
            <div className="relative min-w-0 flex-1">
              <button
                onClick={() => setMobileProfileOpen((v) => !v)}
                className="w-full flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="relative">
                  <Image
                    src={avatarUrl || "/placeholder.svg"}
                    alt="avatar"
                    width={20}
                    height={20}
                    className="rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Profile</span>
              </button>

              {/* Mobile Profile Dropdown */}
              {mobileProfileOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden backdrop-blur-sm">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                    onClick={() => setMobileProfileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </Link>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400"
                    onClick={() => {
                      setMobileProfileOpen(false)
                      signOut()
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="sm:hidden h-16" />
    </>
  )
}
