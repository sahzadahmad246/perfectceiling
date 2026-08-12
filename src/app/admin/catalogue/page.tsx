import type { Metadata } from "next";
import { Suspense } from "react";

import { listCatalogueGroups } from "@/app/admin/catalogue/actions";
import { CataloguePageClient } from "@/components/catalogue-page-client";
import { PageSpinner } from "@/components/page-spinner";

export const metadata: Metadata = {
  title: "Catalogue",
};

export default async function CataloguePage() {
  const groups = await listCatalogueGroups();

  return (
    <Suspense fallback={<PageSpinner label="Loading catalogue..." />}>
      <CataloguePageClient groups={groups} />
    </Suspense>
  );
}
