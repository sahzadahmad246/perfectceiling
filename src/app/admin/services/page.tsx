import type { Metadata } from "next"
import AdminServicesClient from "@/components/admin/services/AdminServicesClient"

export const metadata: Metadata = {
  title: "Services | Perfect Ceiling Admin",
  description: "Manage business services and offerings.",
}

export default function AdminServicesPage() {
  return <AdminServicesClient />
}
