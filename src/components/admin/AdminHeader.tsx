"use client"

import { ArrowLeft, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminHeaderProps {
    title: string
    showBack?: boolean
}

export function AdminHeader({ title, showBack = true }: AdminHeaderProps) {
    const router = useRouter()

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {showBack && (
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-medium text-sm">
                            AD
                        </div>
                        {/* <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin User</span> */}
                    </div>
                </div>
            </div>
        </header>
    )
}
