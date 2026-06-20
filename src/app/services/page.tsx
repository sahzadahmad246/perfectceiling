import type { Metadata } from "next";

import { PublicServicesPage } from "@/components/public-services-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { getPublicServices } from "@/lib/public-content";
import { buildServicesListMetadata } from "@/lib/service-seo";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, services] = await Promise.all([
    getPublicBusinessSettings(),
    getPublicServices(),
  ]);

  const publishedCount = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  ).length;

  return buildServicesListMetadata(settings, publishedCount);
}

export default function ServicesPage() {
  return <PublicServicesPage />;
}