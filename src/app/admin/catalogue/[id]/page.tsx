import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCatalogueGroupById } from "@/app/admin/catalogue/actions";
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
  const item = await getCatalogueGroupById(id);

  return {
    title: item ? getCatalogueDisplayTitle(item) : "Catalogue group",
  };
}

export default async function CatalogueDetailPage({
  params,
}: CatalogueDetailPageProps) {
  const { id } = await params;
  const item = await getCatalogueGroupById(id);

  if (!item) {
    notFound();
  }

  return <CatalogueDetailView item={item} key={item.id} />;
}
