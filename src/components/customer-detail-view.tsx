"use client";

import {
  Calendar,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { CustomerSummaryCharts } from "@/components/customer-summary-charts";
import {
  formatCompactCurrency,
  formatCurrency,
  formatCustomerActivityDate,
  type CustomerDetail,
  type CustomerInvoiceHistoryItem,
  type CustomerQuotationHistoryItem,
} from "@/lib/customers";
import { getInvoicePaymentStatusStyle } from "@/lib/invoices";
import {
  formatQuotationDate,
  getQuotationStatusStyle,
} from "@/lib/quotations";

type CustomerDetailViewProps = {
  customer: CustomerDetail;
};

type CustomerDetailTab = "summary" | "quotes" | "invoices" | "history";

const CUSTOMER_DETAIL_TABS: Array<{ id: CustomerDetailTab; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "quotes", label: "Quotes" },
  { id: "invoices", label: "Invoices" },
  { id: "history", label: "History" },
];

function CustomerProfileMeta({
  icon: Icon,
  children,
}: {
  icon: typeof Phone;
  children: ReactNode;
}) {
  return (
    <p className="flex items-start gap-2 text-sm leading-6 text-muted">
      <Icon className="mt-0.5 shrink-0" size={15} />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  );
}

function CustomerListDivider({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return <div aria-hidden className="my-4 border-t border-border-soft" />;
}

function CustomerSummaryTab({ customer }: { customer: CustomerDetail }) {
  const hasPending = customer.totalPending > 0;

  const stats = [
    {
      label: "Total quoted",
      value: formatCurrency(customer.totalQuoted),
      hint: `${customer.quotationCount} quote${customer.quotationCount === 1 ? "" : "s"}`,
    },
    {
      label: "Total invoiced",
      value: formatCurrency(customer.totalInvoiced),
      hint: `${customer.invoiceCount} invoice${customer.invoiceCount === 1 ? "" : "s"}`,
    },
    {
      label: "Total received",
      value: formatCurrency(customer.totalPaid),
      hint: "Payments collected",
      valueClassName: "text-emerald-700",
    },
    {
      label: "Pending balance",
      value: formatCurrency(customer.totalPending),
      hint: hasPending ? "Outstanding amount" : "All cleared",
      valueClassName: hasPending ? "text-amber-700" : "text-foreground",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <article
            className="rounded-2xl bg-surface-muted px-3 py-4"
            key={stat.label}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              {stat.label}
            </p>
            <p
              className={`mt-2 font-primary text-xl font-semibold leading-none ${stat.valueClassName ?? "text-foreground"}`}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-muted">{stat.hint}</p>
          </article>
        ))}
      </div>

      <div className="mt-5">
        <CustomerSummaryCharts
          invoiceCount={customer.invoiceCount}
          quotationCount={customer.quotationCount}
          totalInvoiced={customer.totalInvoiced}
          totalPaid={customer.totalPaid}
          totalPending={customer.totalPending}
          totalQuoted={customer.totalQuoted}
        />
      </div>
    </div>
  );
}

function CustomerQuotationRow({
  quotation,
  showDivider,
}: {
  quotation: CustomerQuotationHistoryItem;
  showDivider: boolean;
}) {
  const status = getQuotationStatusStyle(quotation.status);
  const workTitle = quotation.workTitle?.trim() || "Untitled work";

  return (
    <li>
      <CustomerListDivider show={showDivider} />
      <Link
        className="block transition hover:opacity-80"
        href={`/admin/quotations/${quotation.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {workTitle}
              <span className="font-normal text-muted">
                {" "}
                ({quotation.quotationNumber})
              </span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={12} />
                {formatQuotationDate(quotation.date)}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-foreground">
            {formatCompactCurrency(quotation.grandTotal)}
          </span>
        </div>
      </Link>
    </li>
  );
}

function CustomerInvoiceRow({
  invoice,
  showDivider,
}: {
  invoice: CustomerInvoiceHistoryItem;
  showDivider: boolean;
}) {
  const status = getInvoicePaymentStatusStyle(invoice.paymentStatus);
  const workTitle = invoice.workTitle?.trim() || "Untitled work";

  return (
    <li>
      <CustomerListDivider show={showDivider} />
      <Link
        className="block transition hover:opacity-80"
        href={`/admin/invoices/${invoice.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {workTitle}
              <span className="font-normal text-muted">
                {" "}
                ({invoice.invoiceNumber})
              </span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={12} />
                {formatCustomerActivityDate(invoice.invoiceDate)}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-foreground">
              {formatCompactCurrency(invoice.grandTotal)}
            </p>
            {invoice.balanceAmount > 0 ? (
              <p className="mt-0.5 text-xs text-amber-700">
                {formatCompactCurrency(invoice.balanceAmount)} due
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}

function CustomerHistoryTab({ customer }: { customer: CustomerDetail }) {
  const entries = [...customer.quotations, ...customer.invoices].sort(
    (left, right) =>
      new Date("date" in left ? left.date : left.invoiceDate).getTime() -
      new Date("date" in right ? right.date : right.invoiceDate).getTime(),
  );

  if (entries.length === 0) {
    return <p className="text-sm text-muted">No work history yet.</p>;
  }

  return (
    <ul>
      {entries.map((entry, index) => {
        const isQuotation = "quotationNumber" in entry;
        const showDivider = index > 0;

        return (
          <li key={`${isQuotation ? "q" : "i"}-${entry.id}`}>
            <CustomerListDivider show={showDivider} />
            <Link
              className="flex items-center justify-between gap-3 text-sm transition hover:opacity-80"
              href={
                isQuotation
                  ? `/admin/quotations/${entry.id}`
                  : `/admin/invoices/${entry.id}`
              }
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {isQuotation ? entry.quotationNumber : entry.invoiceNumber}
                </p>
                <p className="mt-1 text-muted">
                  {entry.workTitle?.trim() || "Untitled work"}
                </p>
              </div>
              <span className="shrink-0 text-muted">
                {formatCustomerActivityDate(
                  isQuotation ? entry.date : entry.invoiceDate,
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function CustomerDetailView({ customer }: CustomerDetailViewProps) {
  const [activeTab, setActiveTab] = useState<CustomerDetailTab>("summary");

  return (
    <>
      <section className="-mx-4 bg-surface-muted px-4 pt-4 sm:-mx-8 sm:px-8">
        <div
          aria-hidden
          className="flex size-16 items-center justify-center rounded-full bg-surface text-primary shadow-sm"
        >
          <UserRound size={30} strokeWidth={1.75} />
        </div>

        <h2 className="mt-3 font-primary text-xl font-bold text-foreground">
          {customer.name}
        </h2>

        <div className="mt-3 space-y-2">
          {customer.phone ? (
            <CustomerProfileMeta icon={Phone}>{customer.phone}</CustomerProfileMeta>
          ) : null}

          {customer.whatsapp ? (
            <CustomerProfileMeta icon={MessageCircle}>
              {customer.whatsapp}
            </CustomerProfileMeta>
          ) : null}

          {customer.email ? (
            <CustomerProfileMeta icon={Mail}>{customer.email}</CustomerProfileMeta>
          ) : null}

          {customer.address ? (
            <CustomerProfileMeta icon={MapPin}>{customer.address}</CustomerProfileMeta>
          ) : null}
        </div>

        <nav aria-label="Customer sections" className="mt-5 flex w-full">
          {CUSTOMER_DETAIL_TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                aria-selected={isActive}
                className={`flex-1 border-b-2 py-2.5 text-center text-sm font-medium transition ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div aria-hidden className="border-b border-border-soft" />
      </section>

      <section className="mt-4" role="tabpanel">
        {activeTab === "summary" ? (
          <CustomerSummaryTab customer={customer} />
        ) : null}

        {activeTab === "quotes" ? (
          customer.quotations.length > 0 ? (
            <ul>
              {customer.quotations.map((quotation, index) => (
                <CustomerQuotationRow
                  key={quotation.id}
                  quotation={quotation}
                  showDivider={index > 0}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No quotations yet for this customer.</p>
          )
        ) : null}

        {activeTab === "invoices" ? (
          customer.invoices.length > 0 ? (
            <ul>
              {customer.invoices.map((invoice, index) => (
                <CustomerInvoiceRow
                  invoice={invoice}
                  key={invoice.id}
                  showDivider={index > 0}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No invoices yet for this customer.</p>
          )
        ) : null}

        {activeTab === "history" ? <CustomerHistoryTab customer={customer} /> : null}
      </section>
    </>
  );
}