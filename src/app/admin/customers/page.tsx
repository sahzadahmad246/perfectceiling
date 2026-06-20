import type { Metadata } from "next";
import { Suspense } from "react";

import { listCustomers } from "@/app/admin/customers/actions";
import { CustomersPageClient } from "@/components/customers-page-client";
import { PageSpinner } from "@/components/page-spinner";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <Suspense fallback={<PageSpinner label="Loading customers..." />}>
      <CustomersPageClient customers={customers} />
    </Suspense>
  );
}