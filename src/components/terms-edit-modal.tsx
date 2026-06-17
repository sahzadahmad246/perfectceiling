"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { parseTerms, serializeTerms } from "@/lib/terms";

const modalOverlayClass =
  "fixed inset-0 z-[10000] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

const termsTextareaClass =
  "mt-4 h-16 w-full resize-none rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

type TermsEditModalProps = {
  open: boolean;
  title?: string;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
};

export function TermsEditModal({
  open,
  title = "Quotation terms",
  value,
  onClose,
  onSave,
}: TermsEditModalProps) {
  const [termDraft, setTermDraft] = useState("");
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLines(parseTerms(value));
    setTermDraft("");
  }, [open, value]);

  if (!open) {
    return null;
  }

  function addLine() {
    const nextTerm = termDraft.trim();

    if (!nextTerm) {
      return;
    }

    setLines((currentLines) => [...currentLines, nextTerm]);
    setTermDraft("");
  }

  function removeLine(index: number) {
    setLines((currentLines) =>
      currentLines.filter((_, lineIndex) => lineIndex !== index),
    );
  }

  function handleSave() {
    onSave(serializeTerms(lines));
    onClose();
  }

  return (
    <div className={modalOverlayClass}>
      <button
        aria-label="Close terms edit modal"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border-soft bg-surface-raised p-5 shadow-popover">
        <p className="text-sm font-medium">{title}</p>
        <textarea
          className={termsTextareaClass}
          onChange={(event) => setTermDraft(event.target.value)}
          placeholder="Write a term, then click Add"
          rows={2}
          value={termDraft}
        />
        <div className="mt-3 flex justify-end">
          <button
            className="inline-flex h-10 items-center gap-1 rounded-full border border-border-strong px-4 text-sm font-medium disabled:opacity-70"
            disabled={!termDraft.trim()}
            onClick={addLine}
            type="button"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        {lines.length > 0 ? (
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
            {lines.map((term, index) => (
              <li
                className="flex items-start gap-2 rounded-md border border-border-soft bg-surface px-3 py-2"
                key={`${term}-${index}`}
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {term}
                </span>
                <button
                  aria-label={`Remove term ${index + 1}`}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition hover:border-primary hover:text-foreground"
                  onClick={() => removeLine(index)}
                  type="button"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Added terms will appear here.</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="h-10 rounded-full border border-border-strong px-5 text-sm font-medium"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
            onClick={handleSave}
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}