"use client";

import { Pencil, ScrollText } from "lucide-react";
import { useMemo, useState } from "react";

import { QuotationFormField } from "@/components/quotation-form-field";

function parseTerms(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

type QuotationTermsFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function QuotationTermsField({ value, onChange }: QuotationTermsFieldProps) {
  const [editing, setEditing] = useState(false);
  const terms = useMemo(() => parseTerms(value), [value]);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ScrollText className="text-muted" size={16} />
          <span>Quotation terms</span>
          <span className="text-xs font-normal text-muted">Optional</span>
        </div>
        <button
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-foreground"
          onClick={() => setEditing((current) => !current)}
          type="button"
        >
          <Pencil size={13} />
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      {editing ? (
        <textarea
          className="mt-3 w-full rounded-xl border border-border-strong bg-surface px-3 py-3 text-sm leading-6 outline-none transition field-sizing-content min-h-28 resize-none focus:border-primary"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Add one term per line"
          value={value}
        />
      ) : terms.length > 0 ? (
        <ul className="mt-3 space-y-3 rounded-xl border border-border-soft bg-surface-raised/70 px-4 py-4">
          {terms.map((term, index) => (
            <li
              className="flex gap-3 text-sm leading-6 text-foreground"
              key={`${term}-${index}`}
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="whitespace-pre-wrap">{term}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-border-strong bg-surface-muted/40 px-4 py-6 text-center">
          <p className="text-sm text-muted">No terms added yet.</p>
          <button
            className="mt-2 text-xs font-medium text-foreground underline-offset-2 hover:underline"
            onClick={() => setEditing(true)}
            type="button"
          >
            Add terms
          </button>
        </div>
      )}

      {editing ? (
        <p className="mt-2 text-xs text-muted">Put each term on a new line.</p>
      ) : null}
    </div>
  );
}