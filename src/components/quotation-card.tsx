"use client";

import {
  Calendar,
  Download,
  Loader2,
  MoreVertical,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { deleteQuotation } from "@/app/admin/quotations/actions";
import { QuotationStatusModal } from "@/components/quotation-status-modal";
import { downloadQuotationPdf } from "@/lib/download-quotation-pdf";
import {
  formatCurrency,
  formatQuotationDate,
  getQuotationStatusCardGlow,
  getQuotationStatusStyle,
  type QuotationListItem,
} from "@/lib/quotations";

const confirmOverlayClass =
  "fixed inset-0 z-[9980] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

const menuDropdownClass =
  "animate-menu-pop fixed z-[9990] w-44 rounded-xl border border-border-soft bg-surface-raised p-1.5 shadow-popover";

type MenuPosition = {
  top?: number;
  bottom?: number;
  right: number;
};

type QuotationCardProps = {
  quotation: QuotationListItem;
  onEdit: (id: string) => void;
};

export function QuotationCard({ quotation, onEdit }: QuotationCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const status = getQuotationStatusStyle(quotation.status);
  const statusGlow = getQuotationStatusCardGlow(quotation.status);
  const workTitle = quotation.workTitle?.trim() || "Untitled work";

  function updateMenuPosition() {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const menuHeight = 188;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 8;

    setMenuPosition({
      right: window.innerWidth - rect.right,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }

  function toggleMenu() {
    setMenuOpen((current) => {
      const next = !current;

      if (next) {
        updateMenuPosition();
      } else {
        setMenuPosition(null);
      }

      return next;
    });
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (isDownloadingPdf) {
        return;
      }

      const target = event.target as Node;

      if (
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setMenuOpen(false);
        setMenuPosition(null);
      }
    }

    function onLayoutChange() {
      updateMenuPosition();
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onLayoutChange);
    window.addEventListener("scroll", onLayoutChange, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onLayoutChange);
      window.removeEventListener("scroll", onLayoutChange, true);
    };
  }, [isDownloadingPdf, menuOpen]);

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);

    try {
      await downloadQuotationPdf(quotation.id);
      toast.success("Quotation PDF downloaded.");
    } catch {
      toast.error("Could not download PDF.");
    } finally {
      setIsDownloadingPdf(false);
      setMenuOpen(false);
      setMenuPosition(null);
    }
  }

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
      setMenuPosition(null);
      router.refresh();
    });
  }

  return (
    <>
      <article className="relative overflow-hidden rounded-xl border border-border-soft bg-surface-raised transition hover:border-border-strong">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={statusGlow}
        />

        <div className="relative z-[1] p-4 pb-3">
          <div className="absolute right-3 top-3 z-10">
            <button
              ref={buttonRef}
              aria-expanded={menuOpen}
              aria-label={`Actions for ${quotation.quotationNumber}`}
              className="inline-flex size-9 items-center justify-center rounded-full border border-transparent text-muted transition hover:border-border-soft hover:bg-surface-muted hover:text-foreground"
              onClick={toggleMenu}
              type="button"
            >
              <MoreVertical size={18} />
            </button>
          </div>

          <Link
            className="block pr-11"
            href={`/admin/quotations/${quotation.id}`}
          >
            <h3 className="font-primary text-sm font-semibold leading-6 text-foreground">
              {workTitle}
              <span className="font-normal text-muted">
                {" "}
                ({quotation.quotationNumber})
              </span>
            </h3>

            <p className="mt-2 text-sm text-muted">
              <span>{quotation.customerName}</span>
              {quotation.customerPhone ? (
                <span> · {quotation.customerPhone}</span>
              ) : null}
            </p>

            {quotation.customerAddress ? (
              <p className="mt-1 text-sm leading-5 text-muted">
                {quotation.customerAddress}
              </p>
            ) : null}
          </Link>
        </div>

        <div
          aria-hidden
          className="relative z-[1] border-t border-dashed border-border-soft"
        />

        <Link
          className="relative z-[1] flex items-center justify-between gap-3 px-4 py-3"
          href={`/admin/quotations/${quotation.id}`}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} />
              {formatQuotationDate(quotation.date)}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <span className="shrink-0 text-sm font-semibold text-foreground">
            {formatCurrency(quotation.grandTotal)}
          </span>
        </Link>
      </article>

      {menuOpen && menuPosition
        ? createPortal(
            <div
              className={menuDropdownClass}
              ref={menuRef}
              style={menuPosition}
            >
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-70"
                disabled={isDownloadingPdf}
                onClick={() => {
                  setMenuOpen(false);
                  setMenuPosition(null);
                  onEdit(quotation.id);
                }}
                type="button"
              >
                <Pencil size={15} />
                Edit
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-70"
                disabled={isDownloadingPdf}
                onClick={() => {
                  setMenuOpen(false);
                  setMenuPosition(null);
                  setStatusModalOpen(true);
                }}
                type="button"
              >
                <RefreshCw size={15} />
                Update status
              </button>
              <button
                aria-busy={isDownloadingPdf}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-70"
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                type="button"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="animate-spin" size={15} />
                ) : (
                  <Download size={15} />
                )}
                {isDownloadingPdf ? "Downloading..." : "Download"}
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50 disabled:opacity-70"
                disabled={isDownloadingPdf}
                onClick={() => {
                  setMenuOpen(false);
                  setMenuPosition(null);
                  setConfirmOpen(true);
                }}
                type="button"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>,
            document.body,
          )
        : null}

      <QuotationStatusModal
        currentStatus={quotation.status}
        onClose={() => setStatusModalOpen(false)}
        onUpdated={() => router.refresh()}
        open={statusModalOpen}
        quotationId={quotation.id}
        quotationNumber={quotation.quotationNumber}
      />

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