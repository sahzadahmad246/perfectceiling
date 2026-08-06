import type { Metadata } from "next";

import { PublicCatalogueDetailPage } from "@/components/public-catalogue-detail-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { buildCatalogueDetailMetadata } from "@/lib/catalogue-seo";
import {
  getPublicCatalogueIds,
  getPublicCatalogueImageById,
} from "@/lib/public-content";

type CatalogueDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const ids = await getPublicCatalogueIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: CatalogueDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const [item, settings] = await Promise.all([
    getPublicCatalogueImageById(id),
    getPublicBusinessSettings(),
  ]);

  if (!item) {
    return {
      title: "Design not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildCatalogueDetailMetadata(item, settings);
}

export default async function CatalogueDetailRoute({
  params,
}: CatalogueDetailPageProps) {
  const { id } = await params;

  return <PublicCatalogueDetailPage id={id} />;
}
