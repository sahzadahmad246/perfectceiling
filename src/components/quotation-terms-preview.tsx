"use client";

import { ScrollText } from "lucide-react";
import { useMemo, useState } from "react";

import { TermsEditModal } from "@/components/terms-edit-modal";
import { QuotationViewSection } from "@/components/quotation-view-primitives";
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
      <QuotationViewSection
        editLabel="Edit quotation terms"
        icon={ScrollText}
        onEdit={() => setEditOpen(true)}
        title="Quotation terms"
      >
        {terms.length > 0 ? (
          <ul className="space-y-3">
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
          <p className="text-sm text-muted">No terms added yet.</p>
        )}
      </QuotationViewSection>

      <TermsEditModal
        onClose={() => setEditOpen(false)}
        onSave={onChange}
        open={editOpen}
        value={value}
      />
    </>
  );
}