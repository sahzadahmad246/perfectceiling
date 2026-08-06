import type { Metadata } from "next";
import { Suspense } from "react";

import { listCatalogueImages } from "@/app/admin/catalogue/actions";
import { CataloguePageClient } from "@/components/catalogue-page-client";
import { PageSpinner } from "@/components/page-spinner";

export const metadata: Metadata = {
  title: "Catalogue",
};

export default async function CataloguePage() {
  const images = await listCatalogueImages();

  return (
    <Suspense fallback={<PageSpinner label="Loading catalogue..." />}>
      <CataloguePageClient images={images} />
    </Suspense>
  );
}
