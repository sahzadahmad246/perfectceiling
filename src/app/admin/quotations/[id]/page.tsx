import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getQuotationById,
  getQuotationDefaults,
} from "@/app/admin/quotations/actions";
import {
  formatCurrency,
  formatUnitType,
  type QuotationUnitType,
} from "@/lib/quotations";

type QuotationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: QuotationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const quotation = await getQuotationById(id);

  return {
    title: quotation
      ? `Quotation ${quotation.quotationNumber}`
      : "Quotation",
  };
}

export default async function QuotationDetailPage({
  params,
}: QuotationDetailPageProps) {
  const { id } = await params;
  const [quotation, defaults] = await Promise.all([
    getQuotationById(id),
    getQuotationDefaults(),
  ]);

  if (!quotation) {
    notFound();
  }

  return (
    <>
      <div className="mt-2 flex items-center gap-3">
        <Link
          aria-label="Back to quotations"
          className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
          href="/admin/quotations"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <div className="min-w-0">
          <p className="text-sm text-muted">Quotation</p>
          <h1 className="truncate text-lg font-medium">
            {quotation.quotationNumber}
          </h1>
        </div>
      </div>

      <section className="mt-5 rounded-md border border-border-soft bg-surface-raised/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">{quotation.date}</p>
            {quotation.workTitle ? (
              <h2 className="mt-2 text-xl font-medium">{quotation.workTitle}</h2>
            ) : null}
          </div>
          <span className="rounded-full border border-border-soft px-2.5 py-1 text-[11px] font-medium capitalize text-muted">
            {quotation.status}
          </span>
        </div>
      </section>

      {quotation.customer ? (
        <section className="mt-4 rounded-md border border-border-soft bg-surface-raised/60 p-4">
          <p className="text-sm font-medium">Customer</p>
          <p className="mt-2 text-sm text-foreground">
            {quotation.customer.name}
          </p>
          <p className="text-sm text-muted">{quotation.customer.phone}</p>
          {quotation.customer.address ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
              {quotation.customer.address}
            </p>
          ) : null}
          {quotation.customer.city ? (
            <p className="text-sm text-muted">{quotation.customer.city}</p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-4 rounded-md border border-border-soft bg-surface-raised/60 p-4">
        <p className="text-sm font-medium">Work items</p>
        <ul className="mt-3 divide-y divide-border-soft">
          {quotation.items.map((item) => (
            <li className="py-4 first:pt-0 last:pb-0" key={item.id}>
              <p className="text-sm font-medium">{item.description}</p>
              {item.notes ? (
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                  {item.notes}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-muted">
                {item.unitType === "lump_sum"
                  ? "Lump sum"
                  : `${item.quantity} ${formatUnitType(item.unitType as QuotationUnitType)} × ${formatCurrency(item.rate)}`}
              </p>
              <p className="mt-1 text-sm font-medium">
                {formatCurrency(item.amount)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-border-soft pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatCurrency(quotation.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Discount</span>
            <span>{formatCurrency(quotation.discountValue)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Grand total</span>
            <span className="font-primary text-lg">
              {formatCurrency(quotation.grandTotal)}
            </span>
          </div>
        </div>
      </section>

      {quotation.terms ? (
        <section className="mt-4 rounded-md border border-border-soft bg-surface-raised/60 p-4">
          <p className="text-sm font-medium">Quotation terms</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
            {quotation.terms}
          </p>
        </section>
      ) : null}

      {defaults.bankDetails ? (
        <section className="mt-4 rounded-md border border-border-soft bg-surface-raised/60 p-4">
          <p className="text-sm font-medium">Payment / bank details</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
            {defaults.bankDetails}
          </p>
        </section>
      ) : null}
    </>
  );
}