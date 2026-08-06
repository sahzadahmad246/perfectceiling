import type { Metadata } from "next";

import { PublicCataloguePage } from "@/components/public-catalogue-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { buildCatalogueListMetadata } from "@/lib/catalogue-seo";
import { getAllPublicCatalogueImages } from "@/lib/public-content";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, images] = await Promise.all([
    getPublicBusinessSettings(),
    getAllPublicCatalogueImages(),
  ]);

  return buildCatalogueListMetadata(settings, images);
}

export default function CataloguePage() {
  return <PublicCataloguePage />;
}
