"use client";

import {
  Briefcase,
  FileText,
  Landmark,
  Package,
  Pencil,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { DiscountModal } from "@/components/discount-modal";
import { QuotationItemImageCountButton } from "@/components/quotation-item-image-count-button";
import { QuotationFormField } from "@/components/quotation-form-field";
import { QuotationItemModal } from "@/components/quotation-item-modal";
import { QuotationTermsField } from "@/components/quotation-terms-field";
import type { QuotationDefaults } from "@/app/admin/quotations/actions";
import {
  calculateDiscountAmount,
  calculateLineItemAmount,
  formatCurrency,
  formatDiscountLabel,
  formatUnitType,
  hasWorkDiscount,
  type QuotationDiscountType,
  type QuotationLineItemDraft,
  type QuotationWorkDraft,
} from "@/lib/quotations";
const inputClass =
  "mt-2 h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary";

type WorkPricingStepProps = {
  work: QuotationWorkDraft;
  defaults: QuotationDefaults;
  subtotal: number;
  grandTotal: number;
  itemsError?: string;
  onWorkChange: <K extends keyof QuotationWorkDraft>(
    key: K,
    value: QuotationWorkDraft[K],
  ) => void;
  onItemsChange: (items: QuotationLineItemDraft[]) => void;
};

export function WorkPricingStep({
  work,
  defaults,
  subtotal,
  grandTotal,
  itemsError,
  onWorkChange,
  onItemsChange,
}: WorkPricingStepProps) {
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuotationLineItemDraft | null>(
    null,
  );

  const discountAmount = calculateDiscountAmount(
    subtotal,
    work.discountType,
    work.discount,
  );
  const hasDiscount = hasWorkDiscount(work);

  const savedItems = work.items.filter((item) => item.name.trim());

  function openAddItemModal() {
    setEditingItem(null);
    setItemModalOpen(true);
  }

  function openEditItemModal(item: QuotationLineItemDraft) {
    setEditingItem(item);
    setItemModalOpen(true);
  }

  function closeItemModal() {
    setItemModalOpen(false);
    setEditingItem(null);
  }

  function handleSaveItem(item: QuotationLineItemDraft) {
    if (editingItem) {
      onItemsChange(
        work.items.map((current) =>
          current.id === editingItem.id ? item : current,
        ),
      );
      return;
    }

    onItemsChange([...work.items, item]);
  }

  function handleRemoveItem(id: string) {
    onItemsChange(work.items.filter((item) => item.id !== id));
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
      <QuotationFormField icon={Briefcase} label="Work title" optional>
        <input
          className={inputClass}
          onChange={(event) => onWorkChange("workTitle", event.target.value)}
          placeholder="e.g. POP false ceiling for hall"
          value={work.workTitle}
        />
      </QuotationFormField>

      <div className="mb-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Package className="text-muted" size={16} />
          <span>
            Work items<span className="text-rose-500"> *</span>
          </span>
        </div>

        {savedItems.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border-strong bg-surface-muted/40 px-4 py-8 text-center">
            <Package className="mx-auto text-muted" size={22} />
            <p className="mt-3 text-sm font-medium text-foreground">
              No items added yet
            </p>
            <p className="mt-1 text-xs text-muted">
              Add work items with area, rate, or lump sum pricing.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {savedItems.map((item, index) => (
              <article
                className="rounded-xl border border-border-soft bg-surface-raised/70 p-4"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="shrink-0 text-muted" size={15} />
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                    </div>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">
                        {item.description}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-xs text-muted">
                        {item.isLumpSum
                          ? "Lump sum"
                          : `${item.quantity} ${formatUnitType(item.unitType)} × ${item.rate}`}
                      </p>
                      <QuotationItemImageCountButton
                        images={item.images}
                        itemName={item.name}
                      />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(calculateLineItemAmount(item))}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      aria-label={`Edit item ${index + 1}`}
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
                      onClick={() => openEditItemModal(item)}
                      type="button"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      aria-label={`Remove item ${index + 1}`}
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => handleRemoveItem(item.id)}
                      type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-sm font-medium transition hover:border-primary"
          onClick={openAddItemModal}
          type="button"
        >
          <Plus size={16} />
          Add item
        </button>

        {itemsError ? (
          <p className="my-2 text-xs font-medium text-rose-600">{itemsError}</p>
        ) : null}
      </div>

      <div className="mb-5 rounded-xl border border-border-soft bg-surface-muted/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Receipt className="text-muted" size={16} />
          <span>Pricing summary</span>
        </div>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {hasDiscount ? (
            <div className="flex items-center justify-between gap-2 rounded-lg px-1 py-1">
              <div className="min-w-0 flex-1">
                <span className="text-muted">
                  Discount ({formatDiscountLabel(work.discountType, work.discount)})
                </span>
                <p className="font-medium text-rose-600">
                  -{formatCurrency(discountAmount)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  aria-label="Edit discount"
                  className="inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
                  onClick={() => setDiscountModalOpen(true)}
                  type="button"
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label="Remove discount"
                  className="inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-rose-50 hover:text-rose-600"
                  onClick={handleRemoveDiscount}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="text-xs font-medium text-foreground underline underline-offset-2 transition hover:text-primary"
              onClick={() => setDiscountModalOpen(true)}
              type="button"
            >
              Add discount
            </button>
          )}

          <div className="flex items-center justify-between border-t border-border-soft pt-3 font-medium">
            <span>Grand total</span>
            <span className="font-primary text-lg">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      <QuotationTermsField
        onChange={(value) => onWorkChange("quotationTerms", value)}
        value={work.quotationTerms}
      />

      {defaults.bankDetails ? (
        <div className="mb-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Landmark className="text-muted" size={16} />
            <span>Payment / bank details</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
            {defaults.bankDetails}
          </p>
        </div>
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