"use client";

import { FileText, Loader2, Trash2, X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteQuotationDraft } from "@/app/admin/quotations/actions";
import type { QuotationDraftListItem } from "@/lib/quotations";
import { formatQuotationDate } from "@/lib/quotations";

type QuotationDraftPickerProps = {
  drafts: QuotationDraftListItem[];
  onClose: () => void;
  onRefresh: () => void;
  onRestore: (draftId: string) => void;
  onStartNew: () => void;
  restoringDraftId?: string | null;
};

export function QuotationDraftPicker({
  drafts,
  onClose,
  onRefresh,
  onRestore,
  onStartNew,
  restoringDraftId = null,
}: QuotationDraftPickerProps) {
  const [isPending, startTransition] = useTransition();
  const isRestoring = restoringDraftId !== null;

  function handleDelete(draftId: string) {
    startTransition(async () => {
      const result = await deleteQuotationDraft(draftId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Draft removed.");
      onRefresh();
    });
  }

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm">
      <button
        aria-label="Close draft picker"
        className="absolute inset-0"
        disabled={isRestoring}
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
          <div>
            <p className="text-[11px] text-muted">Saved drafts</p>
            <h3 className="font-primary text-base font-medium">Restore a draft?</h3>
          </div>
          <button
            aria-label="Close"
            className="text-foreground transition hover:text-primary disabled:opacity-50"
            disabled={isRestoring}
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted">
            You have {drafts.length} saved draft{drafts.length === 1 ? "" : "s"}.
            Pick one to continue or start fresh.
          </p>

          <ul className="mt-4 space-y-2">
            {drafts.map((draft) => {
              const isThisRestoring = restoringDraftId === draft.id;

              return (
                <li
                  className={`rounded-xl border p-3 transition ${
                    isThisRestoring
                      ? "border-primary/30 bg-primary/5"
                      : "border-border-soft bg-surface-raised/70"
                  }`}
                  key={draft.id}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        isThisRestoring
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-muted text-muted"
                      }`}
                    >
                      {isThisRestoring ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                    </div>
                    <button
                      className="min-w-0 flex-1 text-left disabled:opacity-70"
                      disabled={isPending || isRestoring}
                      onClick={() => onRestore(draft.id)}
                      type="button"
                    >
                      <p className="truncate text-sm font-medium text-foreground">
                        {isThisRestoring ? "Restoring draft..." : draft.label}
                      </p>
                      {draft.workTitle && !isThisRestoring ? (
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {draft.workTitle}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted">
                        {isThisRestoring
                          ? "Loading saved details"
                          : `${draft.itemCount} item${draft.itemCount === 1 ? "" : "s"} · ${formatQuotationDate(draft.updatedAt.slice(0, 10))}`}
                      </p>
                    </button>
                    <button
                      aria-label={`Delete draft ${draft.label}`}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-70"
                      disabled={isPending || isRestoring}
                      onClick={() => handleDelete(draft.id)}
                      type="button"
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin" size={15} />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="border-t border-border-soft px-4 py-3">
          <button
            className="h-10 w-full rounded-full border border-border-strong text-sm font-medium disabled:opacity-70"
            disabled={isRestoring}
            onClick={onStartNew}
            type="button"
          >
            Start new quotation
          </button>
        </footer>
      </div>
    </div>
  );
}