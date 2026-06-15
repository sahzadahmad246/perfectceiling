import { FileText } from "lucide-react";
import type { Metadata } from "next";

import { AdminEmptyState } from "@/components/admin-empty-state";

export const metadata: Metadata = {
  title: "Quotations",
};

export default function QuotationsPage() {
  return (
    <>
      <section className="py-10">
        <p className="text-sm text-muted">Quotations</p>
        <h2 className="mt-3 text-4xl font-medium leading-tight">
          Itemized estimates for ceiling work.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Quotations will support square foot, running foot, piece, and
          lump-sum line items with discount and grand total. They will be linked
          directly to customers.
        </p>
      </section>

      <AdminEmptyState
        actionHref="/admin/quotations/new"
        actionLabel="Create quotation"
        icon={FileText}
        title="No quotations yet"
        text="Create a quotation from a customer, add work items, and prepare a printable estimate."
      />
    </>
  );
}
