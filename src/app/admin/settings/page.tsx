import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import BusinessSettingsClient from "@/components/admin/BusinessSettingsClient"

export const metadata: Metadata = {
  title: "Business Settings | Perfect Ceiling",
  description: "Manage business information, status, and terms.",
  openGraph: {
    title: "Business Settings | Perfect Ceiling",
    description: "Manage business information, status, and terms.",
  },
}

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-white">
      <BusinessSettingsClient />
    </div>
  )
}
