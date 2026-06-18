"use client";

import {
  Briefcase,
  Calendar,
  Landmark,
  Pencil,
  Receipt,
  ScrollText,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import type { QuotationDefaults } from "@/app/admin/quotations/actions";
import { DiscountModal } from "@/components/discount-modal";
import { QuotationItemImageViewer } from "@/components/quotation-item-image-viewer";
import { QuotationItemModal } from "@/components/quotation-item-modal";
import { QuotationTermsPreview } from "@/components/quotation-terms-preview";
import {
  QuotationViewDivider,
  QuotationViewLabelValue,
  QuotationViewSection,
} from "@/components/quotation-view-primitives";
import {
  calculateLineItemAmount,
  formatCurrency,
  formatDiscountLabel,
  formatQuotationDate,
  formatUnitType,
  getQuotationStatusStyle,
  hasWorkDiscount,
  type QuotationCustomerDraft,
  type QuotationDiscountType,
  type QuotationLineItemDraft,
  type QuotationWorkDraft,
} from "@/lib/quotations";

type QuotationPreviewStepProps = {
  customer: QuotationCustomerDraft;
  work: QuotationWorkDraft;
  defaults: QuotationDefaults;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  onGoToStep: (step: number) => void;
  onWorkChange: <K extends keyof QuotationWorkDraft>(
    key: K,
    value: QuotationWorkDraft[K],
  ) => void;
  onItemsChange: (items: QuotationLineItemDraft[]) => void;
};

export function QuotationPreviewStep({
  customer,
  work,
  defaults,
  subtotal,
  discountAmount,
  grandTotal,
  onGoToStep,
  onWorkChange,
  onItemsChange,
}: QuotationPreviewStepProps) {
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuotationLineItemDraft | null>(
    null,
  );
  const [previewImages, setPreviewImages] = useState<{
    images: QuotationLineItemDraft["images"];
    title: string;
    initialIndex: number;
  } | null>(null);

  const savedItems = work.items.filter((item) => item.name.trim());
  const customerAddress = [customer.address, customer.city]
    .filter((part) => part.trim())
    .join(", ");
  const draftStatus = getQuotationStatusStyle("draft");
  const previewDate = formatQuotationDate(new Date().toISOString().slice(0, 10));

  function openEditItemModal(item: QuotationLineItemDraft) {
    setEditingItem(item);
    setItemModalOpen(true);
  }

  function closeItemModal() {
    setItemModalOpen(false);
    setEditingItem(null);
  }

  function handleSaveItem(item: QuotationLineItemDraft) {
    if (!editingItem) {
      return;
    }

    onItemsChange(
      work.items.map((current) =>
        current.id === editingItem.id ? item : current,
      ),
    );
  }

  function handleSaveDiscount(
    discountType: QuotationDiscountType,
    discount: string,
  ) {
    onWorkChange("discountType", discountType);
    onWorkChange("discount", discount);
  }

  function handleRemoveDiscount() {
    onWorkChange("discountType", "fixed");
    onWorkChange("discount", "");
  }

  return (
    <>
      <section className="mt-1">
        <h2 className="font-primary text-xl font-medium text-foreground">
          {work.workTitle.trim() || "Untitled work"}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {previewDate}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${draftStatus.className}`}
          >
            {draftStatus.label}
          </span>
        </div>
      </section>

      <QuotationViewSection
        editLabel="Edit customer"
        icon={UserRound}
        onEdit={() => onGoToStep(1)}
        title="Customer"
      >
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

        {customer.notes.trim() ? (
          <>
            <QuotationViewDivider />
            <QuotationViewLabelValue label="Notes" value={customer.notes} />
          </>
        ) : null}
      </QuotationViewSection>

      <QuotationViewSection
        editLabel="Edit work items"
        icon={Briefcase}
        onEdit={() => onGoToStep(2)}
        title="Work items"
      >
        {savedItems.length > 0 ? (
          <ul>
            {savedItems.map((item, index) => {
              const isLumpSum = item.isLumpSum || item.unitType === "lump_sum";

              return (
                <li key={item.id}>
                  {index > 0 ? <QuotationViewDivider /> : null}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>

                      {item.description ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted">
                          {item.description}
                        </p>
                      ) : null}

                      <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted">
                          {isLumpSum
                            ? "Lump sum"
                            : `${item.quantity} ${formatUnitType(item.unitType)} × ${formatCurrency(Number(item.rate) || 0)}`}
                        </span>
                        <span className="shrink-0 font-medium text-foreground">
                          {formatCurrency(calculateLineItemAmount(item))}
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
                                  title: item.name,
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
                    </div>

                    <button
                      aria-label={`Edit ${item.name}`}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
                      onClick={() => openEditItemModal(item)}
                      type="button"
                    >
                      <Pencil size={15} />
                    </button>
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
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {hasWorkDiscount(work) ? (
            <>
              <QuotationViewDivider />
              <div className="flex items-center justify-between gap-3 py-1">
                <span className="text-muted">
                  Discount ({formatDiscountLabel(work.discountType, work.discount)})
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-rose-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                  <button
                    aria-label="Edit discount"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
                    onClick={() => setDiscountModalOpen(true)}
                    type="button"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              className="mt-2 text-xs font-medium text-foreground underline underline-offset-2 transition hover:text-primary"
              onClick={() => setDiscountModalOpen(true)}
              type="button"
            >
              Add discount
            </button>
          )}

          <QuotationViewDivider />
          <div className="flex items-center justify-between py-1 font-medium">
            <span>Grand total</span>
            <span className="font-primary text-lg">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </QuotationViewSection>

      <QuotationTermsPreview
        onChange={(value) => onWorkChange("quotationTerms", value)}
        value={work.quotationTerms}
      />

      {defaults.bankDetails ? (
        <QuotationViewSection icon={Landmark} title="Payment / bank details">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted">
            {defaults.bankDetails}
          </p>
        </QuotationViewSection>
      ) : null}

      <QuotationItemModal
        initialItem={editingItem}
        onClose={closeItemModal}
        onSave={handleSaveItem}
        open={itemModalOpen}
      />

      <QuotationItemImageViewer
        images={previewImages?.images ?? []}
        initialIndex={previewImages?.initialIndex ?? 0}
        onClose={() => setPreviewImages(null)}
        open={previewImages !== null}
        title={previewImages?.title}
      />

      <DiscountModal
        discountType={work.discountType}
        discountValue={work.discount}
        onClose={() => setDiscountModalOpen(false)}
        onRemove={handleRemoveDiscount}
        onSave={handleSaveDiscount}
        open={discountModalOpen}
        subtotal={subtotal}
      />
    </>
  );
}