import { Users } from "lucide-react";
import type { Metadata } from "next";

import { AdminEmptyState } from "@/components/admin-empty-state";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return (
    <>
      <section className="py-10">
        <p className="text-sm text-muted">Customers</p>
        <h2 className="mt-3 text-4xl font-medium leading-tight">
          Keep customer details in one place.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Customers will store name, phone, address, notes, invoice history,
          paid amount, and pending balance.
        </p>
      </section>

      <AdminEmptyState
        actionHref="/admin/customers/new"
        actionLabel="Add customer"
        icon={Users}
        title="No customers yet"
        text="Add customers manually, then create quotations and invoices from their profile so payment history stays connected."
      />
    </>
  );
}
