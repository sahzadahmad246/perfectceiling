import type { Metadata } from "next";

import { PublicCataloguePage } from "@/components/public-catalogue-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { buildCatalogueListMetadata } from "@/lib/catalogue-seo";
import { getAllPublicCatalogueGroups } from "@/lib/public-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, groups] = await Promise.all([
    getPublicBusinessSettings(),
    getAllPublicCatalogueGroups(),
  ]);

  return buildCatalogueListMetadata(settings, groups);
}

export default function CataloguePage() {
  return <PublicCataloguePage />;
}
