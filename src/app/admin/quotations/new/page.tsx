import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Quotation",
};

export default function NewQuotationPage() {
  return (
    <section className="py-10">
      <p className="text-sm text-muted">Quotations</p>
      <h2 className="mt-3 text-4xl font-medium leading-tight">
        Quotation builder comes next.
      </h2>
      <p className="mt-4 text-sm leading-7 text-muted">
        This will become the dynamic item form for description, unit, quantity,
        rate, lump-sum amount, discount, grand total, and customer selection.
      </p>
    </section>
  );
}
