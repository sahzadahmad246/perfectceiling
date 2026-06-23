import { formatAdminFormDraftTime } from "@/lib/admin-form-drafts";

type AdminFormDraftPromptProps = {
  savedAt: string;
  onRestore: () => void;
  onDiscard: () => void;
};

export function AdminFormDraftPrompt({
  savedAt,
  onRestore,
  onDiscard,
}: AdminFormDraftPromptProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-foreground">Unsaved draft found</p>
      <p className="mt-1 text-xs leading-5 text-muted">
        Saved {formatAdminFormDraftTime(savedAt)}. Restore it or start fresh.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          className="h-10 flex-1 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={onRestore}
          type="button"
        >
          Restore draft
        </button>
        <button
          className="h-10 flex-1 rounded-full border border-border-strong px-4 text-sm font-medium"
          onClick={onDiscard}
          type="button"
        >
          Start fresh
        </button>
      </div>
    </div>
  );
}