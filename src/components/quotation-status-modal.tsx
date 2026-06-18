"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateQuotationStatus } from "@/app/admin/quotations/actions";
import {
  getQuotationStatusStyle,
  QUOTATION_ADMIN_STATUSES,
  type QuotationAdminStatus,
} from "@/lib/quotations";

type QuotationStatusModalProps = {
  open: boolean;
  quotationId: string;
  quotationNumber: string;
  currentStatus: string;
  onClose: () => void;
  onUpdated?: () => void;
};

export function QuotationStatusModal({
  open,
  quotationId,
  quotationNumber,
  currentStatus,
  onClose,
  onUpdated,
}: QuotationStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<QuotationAdminStatus>("created");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    const normalized = QUOTATION_ADMIN_STATUSES.find(
      (status) => status === currentStatus,
    );

    setSelectedStatus(normalized ?? "created");
  }, [currentStatus, open]);

  if (!open) {
    return null;
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateQuotationStatus(quotationId, selectedStatus);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Quotation status updated.");
      onClose();
      onUpdated?.();
    });
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm">
      <button
        aria-label="Close status modal"
        className="absolute inset-0"
        disabled={isPending}
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
          <div>
            <p className="text-[11px] text-muted">Quotation status</p>
            <h3 className="font-primary text-base font-medium">{quotationNumber}</h3>
          </div>
          <button
            aria-label="Close status form"
            className="text-foreground transition hover:text-primary disabled:opacity-70"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="space-y-2 px-4 py-4">
          {QUOTATION_ADMIN_STATUSES.map((status) => {
            const style = getQuotationStatusStyle(status);
            const isSelected = selectedStatus === status;

            return (
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border-soft bg-surface-raised/50 hover:border-border-strong"
                }`}
                key={status}
              >
                <input
                  checked={isSelected}
                  className="size-4 accent-primary"
                  disabled={isPending}
                  name="quotation-status"
                  onChange={() => setSelectedStatus(status)}
                  type="radio"
                  value={status}
                />
                <span className="text-sm font-medium text-foreground">
                  {style.label}
                </span>
              </label>
            );
          })}
        </div>

        <footer className="border-t border-border-soft px-4 py-3">
          <div className="flex gap-2">
            <button
              className="h-10 flex-1 rounded-full border border-border-strong text-sm font-medium disabled:opacity-70"
              disabled={isPending}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
              disabled={isPending}
              onClick={handleSave}
              type="button"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Updating...
                </>
              ) : (
                "Update status"
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}