"use client";

import {
  Briefcase,
  Calendar,
  Landmark,
  Plus,
  Receipt,
  ScrollText,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useState } from "react";

import type { InvoiceDefaults } from "@/app/admin/invoices/actions";
import { InvoicePaymentModal } from "@/components/invoice-payment-modal";
import {
  QuotationViewDivider,
  QuotationViewLabelValue,
  QuotationViewSection,
} from "@/components/quotation-view-primitives";
import {
  formatCurrency,
  formatDiscountLabel,
  formatQuotationDate,
  formatUnitType,
  getInvoiceDiscountDisplay,
  getInvoicePaymentStatusStyle,
  parseQuotationItemNotes,
  type InvoiceDetail,
} from "@/lib/invoices";
import { parseTerms } from "@/lib/terms";

type InvoiceDetailViewProps = {
  invoice: InvoiceDetail;
  defaults: InvoiceDefaults;
};

export function InvoiceDetailView({ invoice, defaults }: InvoiceDetailViewProps) {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("recordPayment") === "1" && invoice.balanceAmount > 0) {
      setPaymentModalOpen(true);
    }
  }, [invoice.balanceAmount, searchParams]);

  function closePaymentModal() {
    setPaymentModalOpen(false);

    if (searchParams.get("recordPayment") === "1") {
      router.replace(`/admin/invoices/${invoice.id}`);
    }
  }

  const status = getInvoicePaymentStatusStyle(invoice.paymentStatus);
  const customer = invoice.customer;
  const customerAddress = [customer?.address, customer?.city]
    .filter((part) => part?.trim())
    .join(", ");
  const terms = parseTerms(invoice.notes);
  const { discountType, discountInput, discountAmount, hasDiscount } =
    getInvoiceDiscountDisplay(invoice);

  return (
    <>
      <section className="mt-5">
        <h2 className="font-primary text-xl font-medium text-foreground">
          {invoice.workTitle?.trim() || invoice.invoiceNumber}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {formatQuotationDate(invoice.invoiceDate)}
          </span>
          {invoice.dueDate ? (
            <span>Due {formatQuotationDate(invoice.dueDate)}</span>
          ) : null}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        {invoice.quotationNumber ? (
          <p className="mt-2 text-sm text-muted">
            From quotation{" "}
            <Link
              className="font-medium text-foreground underline-offset-2 hover:underline"
              href={`/admin/quotations/${invoice.quotationId}`}
            >
              {invoice.quotationNumber}
            </Link>
          </p>
        ) : null}
      </section>

      <QuotationViewSection icon={Wallet} title="Payment status">
        <div className="text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-muted">Grand total</span>
            <span className="font-medium">{formatCurrency(invoice.grandTotal)}</span>
          </div>
          <QuotationViewDivider />
          <div className="flex items-center justify-between py-1">
            <span className="text-muted">Paid</span>
            <span className="font-medium text-green-700">
              {formatCurrency(invoice.paidAmount)}
            </span>
          </div>
          <QuotationViewDivider />
          <div className="flex items-center justify-between py-1 font-medium">
            <span>Due amount</span>
            <span className="font-primary text-lg text-rose-600">
              {formatCurrency(invoice.balanceAmount)}
            </span>
          </div>
        </div>

        {invoice.balanceAmount > 0 ? (
          <button
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground"
            onClick={() => setPaymentModalOpen(true)}
            type="button"
          >
            <Plus size={16} />
            Record payment
          </button>
        ) : null}
      </QuotationViewSection>

      {invoice.payments.length > 0 ? (
        <QuotationViewSection icon={Receipt} title="Payment history">
          <ul>
            {invoice.payments.map((payment, index) => (
              <li key={payment.id}>
                {index > 0 ? <QuotationViewDivider /> : null}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatQuotationDate(payment.paymentDate)}
                    </p>
                    {payment.notes?.trim() ? (
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {payment.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </QuotationViewSection>
      ) : null}

      {customer ? (
        <QuotationViewSection icon={UserRound} title="Customer">
          <QuotationViewLabelValue label="Name" value={customer.name} />

          {customer.phone ? (
            <>
              <QuotationViewDivider />
              <QuotationViewLabelValue label="Mobile" value={customer.phone} />
            </>
          ) : null}

          {customerAddress ? (
            <>
              <QuotationViewDivider />
              <QuotationViewLabelValue label="Address" value={customerAddress} />
            </>
          ) : null}

          {customer.notes?.trim() ? (
            <>
              <QuotationViewDivider />
              <QuotationViewLabelValue label="Notes" value={customer.notes} />
            </>
          ) : null}
        </QuotationViewSection>
      ) : null}

      <QuotationViewSection icon={Briefcase} title="Work items">
        {invoice.items.length > 0 ? (
          <ul>
            {invoice.items.map((item, index) => {
              const { description } = parseQuotationItemNotes(item.notes);
              const isLumpSum = item.unitType === "lump_sum";

              return (
                <li key={item.id}>
                  {index > 0 ? <QuotationViewDivider /> : null}

                  <p className="text-sm font-medium text-foreground">
                    {item.description}
                  </p>

                  {description ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted">
                      {description}
                    </p>
                  ) : null}

                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted">
                      {isLumpSum
                        ? "Lump sum"
                        : `${item.quantity} ${formatUnitType(item.unitType)} × ${formatCurrency(item.rate)}`}
                    </span>
                    <span className="shrink-0 font-medium text-foreground">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">No work items added.</p>
        )}
      </QuotationViewSection>

      <QuotationViewSection icon={Receipt} title="Pricing summary">
        <div className="text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
          </div>

          {hasDiscount ? (
            <>
              <QuotationViewDivider />
              <div className="flex items-center justify-between py-1">
                <span className="text-muted">
                  Discount ({formatDiscountLabel(discountType, discountInput)})
                </span>
                <span className="font-medium text-rose-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            </>
          ) : null}

          <QuotationViewDivider />
          <div className="flex items-center justify-between py-1 font-medium">
            <span>Grand total</span>
            <span className="font-primary text-lg">
              {formatCurrency(invoice.grandTotal)}
            </span>
          </div>
        </div>
      </QuotationViewSection>

      {terms.length > 0 ? (
        <QuotationViewSection icon={ScrollText} title="Invoice terms">
          <ul className="space-y-3">
            {terms.map((term, index) => (
              <li
                className="flex gap-3 text-sm leading-6 text-foreground"
                key={`${term}-${index}`}
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="whitespace-pre-wrap">{term}</span>
              </li>
            ))}
          </ul>
        </QuotationViewSection>
      ) : null}

      {defaults.bankDetails ? (
        <QuotationViewSection icon={Landmark} title="Payment / bank details">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted">
            {defaults.bankDetails}
          </p>
        </QuotationViewSection>
      ) : null}

      <InvoicePaymentModal
        balanceAmount={invoice.balanceAmount}
        invoiceId={invoice.id}
        onClose={closePaymentModal}
        onRecorded={() => {
          router.refresh();
          closePaymentModal();
        }}
        open={paymentModalOpen}
      />
    </>
  );
}