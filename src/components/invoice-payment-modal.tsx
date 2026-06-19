"use client";

import { Calendar, CircleDollarSign, Loader2, StickyNote, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { recordPayment } from "@/app/admin/invoices/actions";
import { QuotationFormField } from "@/components/quotation-form-field";
import { formatCurrency } from "@/lib/invoices";

const inputClass =
  "mt-2 h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary";

type InvoicePaymentModalProps = {
  open: boolean;
  invoiceId: string;
  balanceAmount: number;
  onClose: () => void;
  onRecorded: () => void;
};

export function InvoicePaymentModal({
  open,
  invoiceId,
  balanceAmount,
  onClose,
  onRecorded,
}: InvoicePaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    setAmount("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setNotes("");
  }, [open]);

  if (!open) {
    return null;
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await recordPayment(invoiceId, {
        amount,
        paymentDate,
        notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Payment recorded.");
      onRecorded();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm">
      <button
        aria-label="Close payment modal"
        className="absolute inset-0"
        disabled={isPending}
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 w-full max-w-[400px] rounded-2xl border border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
          <div>
            <p className="text-[11px] text-muted">Record payment</p>
            <h3 className="font-primary text-base font-medium">Add deposit</h3>
          </div>
          <button
            aria-label="Close payment form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="px-4 py-4">
          <p className="mb-4 rounded-lg border border-border-soft bg-surface-muted/60 px-3 py-2.5 text-sm">
            <span className="text-muted">Amount due: </span>
            <span className="font-medium text-foreground">
              {formatCurrency(balanceAmount)}
            </span>
          </p>

          <QuotationFormField icon={CircleDollarSign} label="Payment amount" required>
            <input
              className={inputClass}
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount received"
              value={amount}
            />
          </QuotationFormField>

          <QuotationFormField icon={Calendar} label="Payment date" required>
            <input
              className={inputClass}
              onChange={(event) => setPaymentDate(event.target.value)}
              type="date"
              value={paymentDate}
            />
          </QuotationFormField>

          <QuotationFormField icon={StickyNote} label="Notes" optional>
            <textarea
              className="mt-2 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. UPI transfer, cash deposit"
              rows={3}
              value={notes}
            />
          </QuotationFormField>
        </div>

        <footer className="border-t border-border-soft px-4 py-3">
          <div className="flex gap-2">
            <button
              className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium disabled:opacity-70"
              disabled={isPending}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
              disabled={isPending}
              onClick={handleSubmit}
              type="button"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                "Record payment"
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}