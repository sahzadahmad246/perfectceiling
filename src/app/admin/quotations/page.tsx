import type { Metadata } from "next";
import { Suspense } from "react";

import {
  getQuotationDefaults,
  listQuotations,
} from "@/app/admin/quotations/actions";
import { PageSpinner } from "@/components/page-spinner";
import { QuotationsPageClient } from "@/components/quotations-page-client";

export const metadata: Metadata = {
  title: "Quotations",
};

export default async function QuotationsPage() {
  const [quotations, defaults] = await Promise.all([
    listQuotations(),
    getQuotationDefaults(),
  ]);

  return (
    <Suspense fallback={<PageSpinner />}>
      <QuotationsPageClient defaults={defaults} quotations={quotations} />
    </Suspense>
  );
}