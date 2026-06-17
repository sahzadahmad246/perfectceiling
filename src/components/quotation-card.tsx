"use client";

import {
  Calendar,
  ChevronRight,
  Loader2,
  MoreVertical,
  Pencil,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteQuotation } from "@/app/admin/quotations/actions";
import {
  formatCurrency,
  formatQuotationDate,
  getQuotationStatusStyle,
  type QuotationListItem,
} from "@/lib/quotations";

const confirmOverlayClass =
  "fixed inset-0 z-[9980] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

type QuotationCardProps = {
  quotation: QuotationListItem;
  onEdit: (id: string) => void;
};

export function QuotationCard({ quotation, onEdit }: QuotationCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const status = getQuotationStatusStyle(quotation.status);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteQuotation(quotation.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Quotation deleted.");
      setConfirmOpen(false);
      setMenuOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <article className="group relative overflow-hidden rounded-xl border border-border-soft bg-surface-raised shadow-[0_1px_0_rgba(24,24,27,0.04)] transition hover:border-border-strong hover:shadow-[0_8px_24px_rgba(24,24,27,0.06)]">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 opacity-0 transition group-hover:opacity-100" />

        <div className="flex items-start gap-3 p-4">
          <Link
            className="flex min-w-0 flex-1 gap-3"
            href={`/admin/quotations/${quotation.id}`}
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border-soft bg-surface-muted text-foreground transition group-hover:border-border-strong group-hover:bg-surface">
              <span className="font-primary text-xs font-semibold tracking-wide">
                {quotation.quotationNumber.replace(/^Q-/, "")}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-primary text-sm font-semibold text-foreground">
                  {quotation.quotationNumber}
                </p>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
                <User className="shrink-0 text-muted" size={14} />
                <span className="truncate font-medium">{quotation.customerName}</span>
              </div>

              {quotation.customerPhone ? (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <Phone className="shrink-0" size={13} />
                  <span>{quotation.customerPhone}</span>
                </div>
              ) : null}

              {quotation.workTitle ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {quotation.workTitle}
                </p>
              ) : null}

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-soft pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Calendar size={13} />
                  <span>{formatQuotationDate(quotation.date)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  <span>{formatCurrency(quotation.grandTotal)}</span>
                  <ChevronRight
                    className="text-muted transition group-hover:translate-x-0.5 group-hover:text-foreground"
                    size={15}
                  />
                </div>
              </div>
            </div>
          </Link>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              aria-expanded={menuOpen}
              aria-label={`Actions for ${quotation.quotationNumber}`}
              className="inline-flex size-9 items-center justify-center rounded-full border border-transparent text-muted transition hover:border-border-soft hover:bg-surface-muted hover:text-foreground"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen ? (
              <div className="animate-menu-pop absolute right-0 top-10 z-20 w-40 rounded-xl border border-border-soft bg-surface-raised p-1.5 shadow-popover">
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-surface-muted"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(quotation.id);
                  }}
                  type="button"
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  type="button"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {confirmOpen ? (
        <div className={confirmOverlayClass}>
          <button
            aria-label="Close delete confirmation"
            className="absolute inset-0"
            disabled={isPending}
            onClick={() => setConfirmOpen(false)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-border-soft bg-surface-raised p-5 shadow-popover">
            <div className="flex size-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600">
              <Trash2 size={18} />
            </div>
            <h3 className="mt-4 font-primary text-lg font-medium">
              Delete quotation?
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {quotation.quotationNumber}
              </span>{" "}
              for {quotation.customerName}. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium disabled:opacity-70"
                disabled={isPending}
                onClick={() => setConfirmOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-rose-600 text-sm font-medium text-white disabled:opacity-70"
                disabled={isPending}
                onClick={handleDelete}
                type="button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}