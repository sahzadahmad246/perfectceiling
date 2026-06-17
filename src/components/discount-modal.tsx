"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  calculateDiscountAmount,
  formatCurrency,
  parseNumber,
  type QuotationDiscountType,
} from "@/lib/quotations";
import { cn } from "@/lib/utils";

type DiscountModalProps = {
  open: boolean;
  subtotal: number;
  discountType: QuotationDiscountType;
  discountValue: string;
  onClose: () => void;
  onSave: (discountType: QuotationDiscountType, discountValue: string) => void;
  onRemove?: () => void;
};

export function DiscountModal({
  open,
  subtotal,
  discountType: initialType,
  discountValue: initialValue,
  onClose,
  onSave,
  onRemove,
}: DiscountModalProps) {
  const [discountType, setDiscountType] =
    useState<QuotationDiscountType>(initialType);
  const [discountValue, setDiscountValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) {
      return;
    }

    setDiscountType(initialType);
    setDiscountValue(initialValue);
    setError(undefined);
  }, [initialType, initialValue, open]);

  if (!open) {
    return null;
  }

  function validate() {
    const parsed = parseNumber(discountValue);

    if (!discountValue.trim() || parsed <= 0) {
      setError("Discount must be greater than 0.");
      return false;
    }

    if (discountType === "percentage") {
      if (parsed > 100) {
        setError("Percentage cannot be more than 100.");
        return false;
      }
    } else if (parsed > subtotal) {
      setError("Discount cannot be more than the subtotal.");
      return false;
    }

    const amount = calculateDiscountAmount(subtotal, discountType, discountValue);

    if (amount <= 0 || amount > subtotal) {
      setError("Discount cannot be more than the subtotal.");
      return false;
    }

    setError(undefined);
    return true;
  }

  function handleSave() {
    if (!validate()) {
      return;
    }

    onSave(discountType, discountValue.trim());
    onClose();
  }

  const previewAmount = calculateDiscountAmount(
    subtotal,
    discountType,
    discountValue,
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm">
      <button
        aria-label="Close discount modal"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 w-full max-w-[360px] overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-2.5">
          <div>
            <p className="text-[11px] text-muted">Pricing</p>
            <h3 className="font-primary text-base font-medium">Add discount</h3>
          </div>
          <button
            aria-label="Close discount form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="px-4 py-4">
          <div className="grid grid-cols-2 rounded-full border border-border-strong bg-surface-muted/60 p-1">
            <button
              className={cn(
                "rounded-full px-3 py-2 text-xs font-medium transition",
                discountType === "fixed"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
              onClick={() => {
                setDiscountType("fixed");
                setError(undefined);
              }}
              type="button"
            >
              Fixed amount
            </button>
            <button
              className={cn(
                "rounded-full px-3 py-2 text-xs font-medium transition",
                discountType === "percentage"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
              onClick={() => {
                setDiscountType("percentage");
                setError(undefined);
              }}
              type="button"
            >
              Percentage
            </button>
          </div>

          <label className="mt-4 block text-sm font-medium text-foreground">
            {discountType === "fixed" ? "Discount amount" : "Discount percent"}
            <input
              aria-invalid={Boolean(error)}
              className={cn(
                "mt-2 h-10 w-full rounded-md border bg-surface px-3 text-sm outline-none transition focus:border-primary",
                error ? "border-rose-400" : "border-border-strong",
              )}
              inputMode="decimal"
              onChange={(event) => {
                setDiscountValue(event.target.value);
                setError(undefined);
              }}
              placeholder={discountType === "fixed" ? "e.g. 500" : "e.g. 10"}
              value={discountValue}
            />
          </label>

          {error ? (
            <p className="my-2 text-xs font-medium text-rose-600">{error}</p>
          ) : null}

          <div className="mt-3 rounded-lg border border-border-soft bg-surface-muted/60 px-3 py-2.5 text-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted">
                Discount{" "}
                {discountType === "percentage"
                  ? `(${parseNumber(discountValue) || 0}%)`
                  : "(Fixed)"}
              </span>
              <span className="text-sm font-medium text-rose-600">
                -{formatCurrency(previewAmount)}
              </span>
            </div>
          </div>
        </div>

        <footer className="border-t border-border-soft px-4 py-2.5">
          <div className="flex gap-2">
            {onRemove && parseNumber(initialValue) > 0 ? (
              <button
                className="h-10 rounded-full border border-border-strong px-4 text-sm font-medium text-rose-600"
                onClick={() => {
                  onRemove();
                  onClose();
                }}
                type="button"
              >
                Remove
              </button>
            ) : null}
            <button
              className="h-10 flex-1 rounded-full border border-border-strong text-sm font-medium"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="h-10 flex-1 rounded-full bg-primary text-sm font-medium text-primary-foreground"
              onClick={handleSave}
              type="button"
            >
              Apply
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}