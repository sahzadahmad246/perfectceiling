import { ReceiptText } from "lucide-react";
import type { Metadata } from "next";

import { AdminEmptyState } from "@/components/admin-empty-state";

export const metadata: Metadata = {
  title: "Invoices",
};

export default function InvoicesPage() {
  return (
    <>
      <section className="py-10">
        <p className="text-sm text-muted">Invoices</p>
        <h2 className="mt-3 text-4xl font-medium leading-tight">
          Track bills and payment status.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Invoices will track grand total, paid amount, balance amount, due
          date, and payment status.
        </p>
      </section>

      <AdminEmptyState
        actionHref="/admin/invoices/new"
        actionLabel="Create invoice"
        icon={ReceiptText}
        title="No invoices yet"
        text="Invoices can be created manually or converted from accepted quotations."
      />
    </>
  );
}
