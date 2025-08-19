import type { Metadata } from "next"
import AdminTestimonialsClient from "@/components/admin/AdminTestimonialsClient"

export const metadata: Metadata = {
  title: "Testimonials | Perfect Ceiling Admin",
  description: "Manage customer testimonials and reviews.",
}

export default function AdminTestimonialsPage() {
  return <AdminTestimonialsClient />
}
