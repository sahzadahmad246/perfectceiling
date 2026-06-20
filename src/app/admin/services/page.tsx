import type { Metadata } from "next";
import { Suspense } from "react";

import { listServices } from "@/app/admin/services/actions";
import { PageSpinner } from "@/components/page-spinner";
import { ServicesPageClient } from "@/components/services-page-client";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <Suspense fallback={<PageSpinner label="Loading services..." />}>
      <ServicesPageClient services={services} />
    </Suspense>
  );
}