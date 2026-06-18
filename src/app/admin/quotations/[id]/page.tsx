import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getQuotationById,
  getQuotationDefaults,
} from "@/app/admin/quotations/actions";
import { QuotationDetailView } from "@/components/quotation-detail-view";

type QuotationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: QuotationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const quotation = await getQuotationById(id);

  return {
    title: quotation
      ? `Quotation ${quotation.quotationNumber}`
      : "Quotation",
  };
}

export default async function QuotationDetailPage({
  params,
}: QuotationDetailPageProps) {
  const { id } = await params;
  const [quotation, defaults] = await Promise.all([
    getQuotationById(id),
    getQuotationDefaults(),
  ]);

  if (!quotation) {
    notFound();
  }

  return <QuotationDetailView defaults={defaults} quotation={quotation} />;
}