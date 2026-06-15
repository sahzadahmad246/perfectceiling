import {
  FileText,
  IndianRupee,
  FolderKanban,
  ReceiptText,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

const metrics = [
  { label: "Customers", value: "0", icon: Users },
  { label: "Open quotes", value: "0", icon: FileText },
  { label: "Unpaid invoices", value: "0", icon: ReceiptText },
  { label: "Projects", value: "0", icon: FolderKanban },
];

const actions = [
  {
    href: "/admin/customers/new",
    title: "Add customer",
    text: "Save customer name, phone, address, paid amount, and work history.",
  },
  {
    href: "/admin/quotations/new",
    title: "Create quotation",
    text: "Start an itemized estimate with area, rate, and discount.",
  },
  {
    href: "/admin/invoices/new",
    title: "Create invoice",
    text: "Prepare an invoice for accepted or completed work.",
  },
];

export default function AdminPage() {
  return (
    <>
      <section className="py-10">
        <p className="text-sm text-muted">Overview</p>
        <h2 className="mt-3 text-4xl font-medium leading-tight">
          Manage ceiling work from customer to payment.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
          This is the dashboard foundation. Next we will connect these cards to
          Supabase data and build forms for customers, quotations, invoices, and
          projects.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              className="rounded-md border border-border-soft bg-surface-raised/60 p-4"
              key={metric.label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">{metric.label}</p>
                <Icon className="text-muted" size={18} />
              </div>
              <p className="mt-4 text-3xl font-medium">{metric.value}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-md border border-border-soft bg-surface-raised/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted">
            <IndianRupee size={18} />
          </div>
          <div>
            <h3 className="font-medium">Revenue tracking will come later</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Once invoice payments are added, this area can show monthly
              revenue, pending balance, and paid invoices.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 divide-y divide-border-soft border-y border-border-soft">
        {actions.map((action) => (
          <Link className="block py-5 group" href={action.href} key={action.href}>
            <h3 className="font-medium group-hover:underline">
              {action.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted">{action.text}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
