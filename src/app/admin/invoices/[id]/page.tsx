import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  getInvoiceById,
  getInvoiceDefaults,
} from "@/app/admin/invoices/actions";
import { InvoiceDetailView } from "@/components/invoice-detail-view";
import { PageSpinner } from "@/components/page-spinner";

type InvoiceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: InvoiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  return {
    title: invoice?.invoiceNumber ?? "Invoice",
  };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const [invoice, defaults] = await Promise.all([
    getInvoiceById(id),
    getInvoiceDefaults(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <Suspense fallback={<PageSpinner label="Loading invoice..." />}>
      <InvoiceDetailView defaults={defaults} invoice={invoice} />
    </Suspense>
  );
}