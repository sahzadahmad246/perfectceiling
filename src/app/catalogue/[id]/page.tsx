import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import type { Metadata } from "next";

import { PublicCatalogueDetailPage } from "@/components/public-catalogue-detail-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { buildCatalogueDetailMetadata } from "@/lib/catalogue-seo";
import {
  getPublicCatalogueGroupById,
  getPublicCatalogueIds,
} from "@/lib/public-content";

export const revalidate = 60;

type CatalogueDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ image?: string }>;
};

export async function generateStaticParams() {
  const ids = await getPublicCatalogueIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
  searchParams,
}: CatalogueDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { image: imageId } = await searchParams;
  const [item, settings] = await Promise.all([
    getPublicCatalogueGroupById(id),
    getPublicBusinessSettings(),
  ]);

  if (!item) {
    return {
      title: "Design not found",
      robots: NON_INDEXABLE_ROBOTS,
    };
  }

  return buildCatalogueDetailMetadata(item, settings, { imageId });
}

export default async function CatalogueDetailRoute({
  params,
  searchParams,
}: CatalogueDetailPageProps) {
  const { id } = await params;
  const { image: imageId } = await searchParams;

  return <PublicCatalogueDetailPage id={id} imageId={imageId ?? null} />;
}
