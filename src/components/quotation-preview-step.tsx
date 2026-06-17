"use client";

import { Briefcase, Landmark, Pencil, Receipt, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { QuotationDefaults } from "@/app/admin/quotations/actions";
import { DiscountModal } from "@/components/discount-modal";
import { QuotationItemModal } from "@/components/quotation-item-modal";
import { QuotationTermsPreview } from "@/components/quotation-terms-preview";
import {
  calculateLineItemAmount,
  formatCurrency,
  formatDiscountLabel,
  formatUnitType,
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

type PreviewSectionProps = {
  icon: LucideIcon;
  title: string;
  onEdit?: () => void;
  editLabel?: string;
  children: ReactNode;
};

function PreviewSection({
  icon: Icon,
  title,
  onEdit,
  editLabel = "Edit",
  children,
}: PreviewSectionProps) {
  return (
    <section className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="text-muted" size={16} />
          <span>{title}</span>
        </div>
        {onEdit ? (
          <button
            aria-label={editLabel}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
            onClick={onEdit}
            type="button"
          >
            <Pencil size={15} />
          </button>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

type PreviewRowProps = {
  label: string;
  value: string;
};

function PreviewRow({ label, value }: PreviewRowProps) {
  if (!value.trim()) {
    return null;
  }

  return (
    <div className="text-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap leading-6 text-foreground">
        {value}
      </p>
    </div>
  );
}

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

  const savedItems = work.items.filter((item) => item.name.trim());
  const showItemNumbers = savedItems.length > 1;

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
      <PreviewSection
        editLabel="Edit customer"
        icon={UserRound}
        onEdit={() => onGoToStep(1)}
        title="Customer"
      >
        <div className="space-y-3">
          <PreviewRow label="Name" value={customer.name} />
          <PreviewRow label="Mobile" value={customer.phone} />
          <PreviewRow label="Address" value={customer.address} />
          <PreviewRow label="Notes" value={customer.notes} />
        </div>
      </PreviewSection>

      <PreviewSection
        editLabel="Edit work details"
        icon={Briefcase}
        onEdit={() => onGoToStep(2)}
        title="Work & pricing"
      >
        {savedItems.length > 0 ? (
          <div>
            {savedItems.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? (
                  <div
                    aria-hidden
                    className="my-3 border-t border-dashed border-border-strong"
                  />
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {showItemNumbers ? (
                        <span className="text-muted">{index + 1}. </span>
                      ) : null}
                      {item.name}
                    </p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted">
                      {item.isLumpSum
                        ? "Lump sum"
                        : `${item.quantity} ${formatUnitType(item.unitType)} × ${item.rate}`}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(calculateLineItemAmount(item))}
                    </p>
                  </div>
                  <button
                    aria-label={`Edit item ${index + 1}`}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
                    onClick={() => openEditItemModal(item)}
                    type="button"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-border-soft bg-surface-muted/50 p-4 text-sm">
          <p className="font-medium text-foreground">Pricing summary</p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {hasWorkDiscount(work) ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted">
                  Discount (
                  {formatDiscountLabel(work.discountType, work.discount)})
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-rose-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                  <button
                    aria-label="Edit discount"
                    className="inline-flex size-7 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
                    onClick={() => setDiscountModalOpen(true)}
                    type="button"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-border-soft pt-3 font-medium">
              <span>Grand total</span>
              <span className="font-primary text-lg">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </PreviewSection>

      <QuotationTermsPreview
        onChange={(value) => onWorkChange("quotationTerms", value)}
        value={work.quotationTerms}
      />

      {defaults.bankDetails ? (
        <PreviewSection icon={Landmark} title="Payment / bank details">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted">
            {defaults.bankDetails}
          </p>
        </PreviewSection>
      ) : null}

      <QuotationItemModal
        initialItem={editingItem}
        onClose={closeItemModal}
        onSave={handleSaveItem}
        open={itemModalOpen}
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