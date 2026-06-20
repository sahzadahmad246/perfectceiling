"use client";

import { FileText, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  customerPhoneKeyToHref,
  formatCompactCurrency,
  formatCustomerActivityDate,
  getCustomerTotalRevenue,
  type CustomerListItem,
} from "@/lib/customers";

const AMOUNT_ROTATE_MS = 3500;

type CustomerCardProps = {
  customer: CustomerListItem;
};

function CustomerCardAmount({ customer }: { customer: CustomerListItem }) {
  const hasPending = customer.totalPending > 0;
  const totalRevenue = getCustomerTotalRevenue(customer);
  const shouldAlternate = hasPending && totalRevenue > 0;
  const [showDue, setShowDue] = useState(true);

  useEffect(() => {
    if (!shouldAlternate) {
      return;
    }

    const interval = window.setInterval(() => {
      setShowDue((current) => !current);
    }, AMOUNT_ROTATE_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [shouldAlternate]);

  if (shouldAlternate) {
    return (
      <div
        aria-live="polite"
        className="relative h-5 min-w-[4.5rem] overflow-hidden text-right"
      >
        <span
          className={`absolute inset-0 text-sm font-semibold text-amber-700 transition-all duration-500 ${
            showDue
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          {formatCompactCurrency(customer.totalPending)} due
        </span>
        <span
          className={`absolute inset-0 text-sm font-semibold text-foreground transition-all duration-500 ${
            showDue
              ? "pointer-events-none translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          {formatCompactCurrency(totalRevenue)} revenue
        </span>
      </div>
    );
  }

  if (hasPending) {
    return (
      <span className="whitespace-nowrap text-sm font-semibold text-amber-700">
        {formatCompactCurrency(customer.totalPending)} due
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap text-sm font-semibold text-foreground">
      {formatCompactCurrency(totalRevenue)} revenue
    </span>
  );
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const href = customerPhoneKeyToHref(customer.phoneKey);
  const hasPending = customer.totalPending > 0;

  return (
    <article className="relative overflow-hidden rounded-xl border border-border-soft bg-surface-raised transition hover:border-border-strong">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background: hasPending
            ? "radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.08), transparent 70%)"
            : "radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.06), transparent 70%)",
        }}
      />

      <Link className="relative z-[1] block p-4 pb-3" href={href}>
        <div className="flex items-start justify-between gap-3 pr-1">
          <h3 className="min-w-0 font-primary text-sm font-semibold leading-6 text-foreground">
            {customer.name}
          </h3>

          <p className="shrink-0 text-right text-[10px] text-muted">
            Last activity on {formatCustomerActivityDate(customer.lastActivityAt)}
          </p>
        </div>

        <p className="mt-2 text-sm text-muted">{customer.phone}</p>

        {customer.address ? (
          <p className="mt-1 text-sm leading-5 text-muted">{customer.address}</p>
        ) : null}
      </Link>

      <div
        aria-hidden
        className="relative z-[1] border-t border-dashed border-border-soft"
      />

      <Link
        className="relative z-[1] flex items-center px-4 py-3"
        href={href}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
          <FileText size={13} />
          <span>
            {customer.quotationCount}{" "}
            {customer.quotationCount === 1 ? "quote" : "quotes"}
          </span>
        </span>

        <span className="absolute left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 text-xs text-muted">
          <ReceiptText size={13} />
          <span>
            {customer.invoiceCount}{" "}
            {customer.invoiceCount === 1 ? "invoice" : "invoices"}
          </span>
        </span>

        <span className="ml-auto shrink-0 pl-2">
          <CustomerCardAmount customer={customer} />
        </span>
      </Link>
    </article>
  );
}