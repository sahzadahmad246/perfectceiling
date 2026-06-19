"use client";

import {
  ArrowLeft,
  Download,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteInvoice } from "@/app/admin/invoices/actions";
import { AdminDetailBreadcrumbBar } from "@/components/admin-detail-breadcrumb-bar";
import { downloadInvoicePdf } from "@/lib/download-invoice-pdf";
import { getInvoiceDetailBreadcrumb } from "@/lib/admin-nav";

const confirmOverlayClass =
  "fixed inset-0 z-[9980] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

type InvoiceDetailHeaderProps = {
  invoiceId: string;
  invoiceNumber: string;
  balanceAmount: number;
};

export function InvoiceDetailHeader({
  invoiceId,
  invoiceNumber,
  balanceAmount,
}: InvoiceDetailHeaderProps) {
  const router = useAppRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (isDownloadingPdf) {
        return;
      }

      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isDownloadingPdf]);

  function handleEdit() {
    setMenuOpen(false);
    router.push(`/admin/invoices?edit=${invoiceId}`);
  }

  function handleRecordPayment() {
    setMenuOpen(false);
    router.push(`/admin/invoices/${invoiceId}?recordPayment=1`);
  }

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);

    try {
      await downloadInvoicePdf(invoiceId);
      toast.success("Invoice PDF downloaded.");
    } catch {
      toast.error("Could not download PDF.");
    } finally {
      setIsDownloadingPdf(false);
      setMenuOpen(false);
    }
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInvoice(invoiceId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice deleted.");
      setConfirmOpen(false);
      setMenuOpen(false);
      router.push("/admin/invoices");
      router.refresh();
    });
  }

  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 bg-surface/90 backdrop-blur-xl sm:-mx-8">
        <header className="border-b border-border-soft px-4 py-2 sm:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center">
            <Link
              aria-label="Back to invoices"
              className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
              href="/admin/invoices"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
          </div>

          <h1 className="truncate text-center font-primary text-base font-medium">
            {invoiceNumber}
          </h1>

          <div className="relative flex justify-end" ref={menuRef}>
            <button
              aria-expanded={menuOpen}
              aria-label={`Actions for ${invoiceNumber}`}
              className="inline-flex size-9 items-center justify-center rounded-full border border-transparent text-muted transition hover:border-border-soft hover:bg-surface-muted hover:text-foreground disabled:opacity-70"
              disabled={isPending || isDownloadingPdf}
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen ? (
              <div className="animate-menu-pop absolute right-0 top-10 z-30 w-48 rounded-xl border border-border-soft bg-surface-raised p-1.5 shadow-popover">
                {balanceAmount > 0 ? (
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-70"
                    disabled={isDownloadingPdf || isPending}
                    onClick={handleRecordPayment}
                    type="button"
                  >
                    <Plus size={15} />
                    Record payment
                  </button>
                ) : null}
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-70"
                  disabled={isDownloadingPdf || isPending}
                  onClick={handleEdit}
                  type="button"
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  aria-busy={isDownloadingPdf}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-70"
                  disabled={isDownloadingPdf || isPending}
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
                  disabled={isPending || isDownloadingPdf}
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
        </header>

        <AdminDetailBreadcrumbBar
          items={getInvoiceDetailBreadcrumb(invoiceNumber)}
        />
      </div>

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
              Delete invoice?
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {invoiceNumber}
              </span>
              . This action cannot be undone.
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