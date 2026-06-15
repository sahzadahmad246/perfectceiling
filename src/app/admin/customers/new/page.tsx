import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Customer",
};

export default function NewCustomerPage() {
  return (
    <section className="py-10">
      <p className="text-sm text-muted">Customers</p>
      <h2 className="mt-3 text-4xl font-medium leading-tight">
        Add customer form comes next.
      </h2>
      <p className="mt-4 text-sm leading-7 text-muted">
        This route is ready. The next implementation step is a validated form
        that saves customer records to Supabase and later shows invoice/payment
        history per customer.
      </p>
    </section>
  );
}
