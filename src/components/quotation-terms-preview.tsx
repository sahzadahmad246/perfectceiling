"use client";

import { Pencil, ScrollText } from "lucide-react";
import { useMemo, useState } from "react";

import { TermsEditModal } from "@/components/terms-edit-modal";
import { parseTerms } from "@/lib/terms";

type QuotationTermsPreviewProps = {
  value: string;
  onChange: (value: string) => void;
};

export function QuotationTermsPreview({
  value,
  onChange,
}: QuotationTermsPreviewProps) {
  const [editOpen, setEditOpen] = useState(false);
  const terms = useMemo(() => parseTerms(value), [value]);

  return (
    <>
      <section className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ScrollText className="text-muted" size={16} />
            <span>Quotation terms</span>
          </div>
          <button
            aria-label="Edit quotation terms"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
            onClick={() => setEditOpen(true)}
            type="button"
          >
            <Pencil size={15} />
          </button>
        </div>

        {terms.length > 0 ? (
          <ul className="mt-3 space-y-3">
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
          <p className="mt-3 text-sm text-muted">No terms added yet.</p>
        )}
      </section>

      <TermsEditModal
        onClose={() => setEditOpen(false)}
        onSave={onChange}
        open={editOpen}
        value={value}
      />
    </>
  );
}