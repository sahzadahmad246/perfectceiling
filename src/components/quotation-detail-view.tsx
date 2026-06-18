"use client";

import {
  Briefcase,
  Calendar,
  Landmark,
  Receipt,
  ScrollText,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import type { QuotationDefaults } from "@/app/admin/quotations/actions";
import { QuotationItemImageViewer } from "@/components/quotation-item-image-viewer";
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
  getQuotationDiscountDisplay,
  getQuotationStatusStyle,
  parseQuotationItemNotes,
  type QuotationDetail,
  type QuotationLineItemImageDraft,
} from "@/lib/quotations";
import { parseTerms } from "@/lib/terms";

type QuotationDetailViewProps = {
  quotation: QuotationDetail;
  defaults: QuotationDefaults;
};

export function QuotationDetailView({
  quotation,
  defaults,
}: QuotationDetailViewProps) {
  const [previewImages, setPreviewImages] = useState<{
    images: QuotationLineItemImageDraft[];
    title: string;
    initialIndex: number;
  } | null>(null);

  const status = getQuotationStatusStyle(quotation.status);
  const customer = quotation.customer;
  const customerAddress = [customer?.address, customer?.city]
    .filter((part) => part?.trim())
    .join(", ");
  const terms = parseTerms(quotation.terms);
  const { discountType, discountInput, discountAmount, hasDiscount } =
    getQuotationDiscountDisplay(quotation);

  return (
    <>
      <section className="mt-5">
        <h2 className="font-primary text-xl font-medium text-foreground">
          {quotation.workTitle?.trim() || quotation.quotationNumber}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {formatQuotationDate(quotation.date)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </section>

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
        {quotation.items.length > 0 ? (
          <ul>
            {quotation.items.map((item, index) => {
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

                  {item.images.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.images.map((image, imageIndex) => (
                        <button
                          className="group relative size-16 overflow-hidden rounded-lg border border-border-soft bg-surface-muted transition hover:border-border-strong"
                          key={image.id}
                          onClick={() =>
                            setPreviewImages({
                              images: item.images,
                              title: item.description,
                              initialIndex: imageIndex,
                            })
                          }
                          type="button"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={image.description.trim() || "Item image"}
                            className="size-full object-cover"
                            src={image.url}
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
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
            <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
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
              {formatCurrency(quotation.grandTotal)}
            </span>
          </div>
        </div>
      </QuotationViewSection>

      {terms.length > 0 ? (
        <QuotationViewSection icon={ScrollText} title="Quotation terms">
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

      <QuotationItemImageViewer
        images={previewImages?.images ?? []}
        initialIndex={previewImages?.initialIndex ?? 0}
        onClose={() => setPreviewImages(null)}
        open={previewImages !== null}
        title={previewImages?.title}
      />
    </>
  );
}