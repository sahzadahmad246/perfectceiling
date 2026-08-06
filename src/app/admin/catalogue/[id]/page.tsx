import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCatalogueImageById } from "@/app/admin/catalogue/actions";
import { CatalogueDetailView } from "@/components/catalogue-detail-view";
import { getCatalogueDisplayTitle } from "@/lib/catalogue";

type CatalogueDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: CatalogueDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getCatalogueImageById(id);

  return {
    title: item ? getCatalogueDisplayTitle(item) : "Catalogue image",
  };
}

export default async function CatalogueDetailPage({
  params,
}: CatalogueDetailPageProps) {
  const { id } = await params;
  const item = await getCatalogueImageById(id);

  if (!item) {
    notFound();
  }

  return <CatalogueDetailView item={item} key={item.id} />;
}
