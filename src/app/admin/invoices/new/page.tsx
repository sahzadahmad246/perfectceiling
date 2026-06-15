import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Invoice",
};

export default function NewInvoicePage() {
  return (
    <section className="py-10">
      <p className="text-sm text-muted">Invoices</p>
      <h2 className="mt-3 text-4xl font-medium leading-tight">
        Invoice builder comes next.
      </h2>
      <p className="mt-4 text-sm leading-7 text-muted">
        This route will reuse the quotation item model and add payment status,
        due date, paid amount, and balance amount.
      </p>
    </section>
  );
}
