import type { Metadata } from "next"
import ServicesClientPage from "@/components/services/ServicesClientPage"

export const metadata: Metadata = {
  title: "Services | Perfect Ceiling",
  description: "Explore our comprehensive range of professional services with detailed information and pricing.",
  openGraph: {
    title: "Services | Perfect Ceiling",
    description: "Explore our comprehensive range of professional services with detailed information and pricing.",
    type: "website",
  },
}

export default async function ServicesPage() {
  return <ServicesClientPage />
}
