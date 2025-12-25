import { AdminHeader } from "@/components/admin/AdminHeader"
import { ReactNode } from "react"

interface DashboardPageWrapperProps {
    children: ReactNode
    title: string
    showBack?: boolean
}

export function DashboardPageWrapper({ children, title, showBack }: DashboardPageWrapperProps) {
    return (
        <div className="min-h-screen bg-slate-50">
            <AdminHeader title={title} showBack={showBack} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
