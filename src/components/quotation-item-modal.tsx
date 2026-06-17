"use client";

import {
  AlignLeft,
  Calculator,
  CircleDollarSign,
  FileText,
  Ruler,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { FormSelect } from "@/components/form-select";
import { QuotationFormField } from "@/components/quotation-form-field";
import {
  calculateLineItemAmount,
  createEmptyLineItem,
  formatCurrency,
  getUnitLabel,
  type QuotationLineItemDraft,
  type QuotationUnitType,
} from "@/lib/quotations";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 h-10 w-full rounded-md border bg-surface px-3 text-sm outline-none transition focus:border-primary";

const textareaClass =
  "mt-2 w-full rounded-md border bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

const UNIT_OPTIONS: { value: QuotationUnitType; label: string }[] = [
  { value: "sq_ft", label: "sq.ft" },
  { value: "running_ft", label: "running ft" },
  { value: "piece", label: "piece" },
];

type ItemFieldErrors = {
  name?: string;
  quantity?: string;
  rate?: string;
  amount?: string;
};

type QuotationItemModalProps = {
  open: boolean;
  initialItem?: QuotationLineItemDraft | null;
  onClose: () => void;
  onSave: (item: QuotationLineItemDraft) => void;
};

export function QuotationItemModal({
  open,
  initialItem,
  onClose,
  onSave,
}: QuotationItemModalProps) {
  const [item, setItem] = useState<QuotationLineItemDraft>(createEmptyLineItem);
  const [errors, setErrors] = useState<ItemFieldErrors>({});
  const isEditing = Boolean(initialItem);

  useEffect(() => {
    if (!open) {
      return;
    }

    setItem(initialItem ? { ...initialItem } : createEmptyLineItem());
    setErrors({});
  }, [initialItem, open]);

  if (!open) {
    return null;
  }

  function updateItem(patch: Partial<QuotationLineItemDraft>) {
    setItem((current) => ({ ...current, ...patch }));

    const nextErrors = { ...errors };

    if ("name" in patch) {
      nextErrors.name = undefined;
    }

    if ("quantity" in patch) {
      nextErrors.quantity = undefined;
    }

    if ("rate" in patch) {
      nextErrors.rate = undefined;
    }

    if ("amount" in patch) {
      nextErrors.amount = undefined;
    }

    setErrors(nextErrors);
  }

  function validateItem() {
    const nextErrors: ItemFieldErrors = {};

    if (!item.name.trim()) {
      nextErrors.name = "Item name is required.";
    }

    if (item.isLumpSum) {
      if (!item.amount.trim() || calculateLineItemAmount(item) <= 0) {
        nextErrors.amount = "Enter a valid total amount.";
      }
    } else {
      if (!item.quantity.trim()) {
        nextErrors.quantity = "Area is required.";
      }

      if (!item.rate.trim()) {
        nextErrors.rate = "Rate is required.";
      }

      if (
        item.quantity.trim() &&
        item.rate.trim() &&
        calculateLineItemAmount(item) <= 0
      ) {
        nextErrors.rate = "Enter a valid area and rate.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validateItem()) {
      return;
    }

    onSave({ ...item, notes: "" });
    onClose();
  }

  const lineTotal = calculateLineItemAmount(item);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm">
      <button
        aria-label="Close add item modal"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 flex max-h-[min(78vh,640px)] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-2.5">
          <div>
            <p className="text-[11px] text-muted">Work item</p>
            <h3 className="font-primary text-base font-medium">
              {isEditing ? "Edit item" : "Add item"}
            </h3>
          </div>
          <button
            aria-label="Close item form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <QuotationFormField
            compact
            error={errors.name}
            icon={FileText}
            label="Item name"
            required
          >
            <input
              aria-invalid={Boolean(errors.name)}
              className={cn(
                inputClass,
                errors.name ? "border-rose-400" : "border-border-strong",
              )}
              onChange={(event) => updateItem({ name: event.target.value })}
              placeholder="e.g. POP ceiling work"
              value={item.name}
            />
          </QuotationFormField>

          <QuotationFormField compact icon={AlignLeft} label="Item description" optional>
            <textarea
              className={`${textareaClass} min-h-16 border-border-strong`}
              onChange={(event) => updateItem({ description: event.target.value })}
              placeholder="Short description of the work"
              value={item.description}
            />
          </QuotationFormField>

          <label className="mb-3 flex items-center gap-2 text-sm">
            <input
              checked={item.isLumpSum}
              className="size-4 rounded border-border-strong"
              onChange={(event) =>
                updateItem({
                  isLumpSum: event.target.checked,
                  unitType: event.target.checked
                    ? "lump_sum"
                    : item.unitType === "lump_sum"
                      ? "sq_ft"
                      : item.unitType,
                })
              }
              type="checkbox"
            />
            <CircleDollarSign className="text-muted" size={15} />
            Lump sum only
          </label>

          {!item.isLumpSum ? (
            <>
              <div className="mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Ruler className="text-muted" size={16} />
                    <span>
                      Area<span className="text-rose-500"> *</span>
                    </span>
                  </div>
                  <FormSelect
                    ariaLabel="Select unit"
                    onChange={(unitType) => updateItem({ unitType })}
                    options={UNIT_OPTIONS}
                    size="sm"
                    value={
                      item.unitType === "lump_sum" ? "sq_ft" : item.unitType
                    }
                  />
                </div>
                <input
                  aria-invalid={Boolean(errors.quantity)}
                  className={cn(
                    inputClass,
                    errors.quantity ? "border-rose-400" : "border-border-strong",
                  )}
                  inputMode="decimal"
                  onChange={(event) => updateItem({ quantity: event.target.value })}
                  placeholder={`Enter area in ${getUnitLabel(item.unitType === "lump_sum" ? "sq_ft" : item.unitType)}`}
                  value={item.quantity}
                />
                {errors.quantity ? (
                  <p className="my-2 text-xs font-medium text-rose-600">
                    {errors.quantity}
                  </p>
                ) : null}
              </div>

              <QuotationFormField
                compact
                error={errors.rate}
                icon={Calculator}
                label="Rate"
                required
              >
                <input
                  aria-invalid={Boolean(errors.rate)}
                  className={cn(
                    inputClass,
                    errors.rate ? "border-rose-400" : "border-border-strong",
                  )}
                  inputMode="decimal"
                  onChange={(event) => updateItem({ rate: event.target.value })}
                  placeholder="Rate per unit"
                  value={item.rate}
                />
              </QuotationFormField>
            </>
          ) : (
            <QuotationFormField
              compact
              error={errors.amount}
              icon={CircleDollarSign}
              label="Total amount"
              required
            >
              <input
                aria-invalid={Boolean(errors.amount)}
                className={cn(
                  inputClass,
                  errors.amount ? "border-rose-400" : "border-border-strong",
                )}
                inputMode="decimal"
                onChange={(event) => updateItem({ amount: event.target.value })}
                placeholder="Enter lump sum amount"
                value={item.amount}
              />
            </QuotationFormField>
          )}

          <div className="rounded-lg border border-border-soft bg-surface-muted/60 px-3 py-2.5 text-sm">
            <span className="text-xs text-muted">Line total</span>
            <p className="mt-0.5 font-primary text-base font-medium text-foreground">
              {formatCurrency(lineTotal)}
            </p>
          </div>
        </div>

        <footer className="border-t border-border-soft px-4 py-2.5">
          <div className="flex gap-2">
            <button
              className="h-10 flex-1 rounded-full border border-border-strong text-sm font-medium"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
              onClick={handleSave}
              type="button"
            >
              {isEditing ? "Save" : "Add"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}