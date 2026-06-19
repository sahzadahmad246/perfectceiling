import type { Metadata } from "next";
import { Suspense } from "react";

import { getInvoiceDefaults, listInvoices } from "@/app/admin/invoices/actions";
import { InvoicesPageClient } from "@/components/invoices-page-client";
import { PageSpinner } from "@/components/page-spinner";

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function InvoicesPage() {
  const [invoices, defaults] = await Promise.all([
    listInvoices(),
    getInvoiceDefaults(),
  ]);

  return (
    <Suspense fallback={<PageSpinner />}>
      <InvoicesPageClient defaults={defaults} invoices={invoices} />
    </Suspense>
  );
}