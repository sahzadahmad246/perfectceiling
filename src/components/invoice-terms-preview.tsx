"use client";

import { ScrollText } from "lucide-react";
import { useMemo, useState } from "react";

import { QuotationViewSection } from "@/components/quotation-view-primitives";
import { TermsEditModal } from "@/components/terms-edit-modal";
import { parseTerms } from "@/lib/terms";

type InvoiceTermsPreviewProps = {
  value: string;
  onChange: (value: string) => void;
};

export function InvoiceTermsPreview({
  value,
  onChange,
}: InvoiceTermsPreviewProps) {
  const [editOpen, setEditOpen] = useState(false);
  const terms = useMemo(() => parseTerms(value), [value]);

  return (
    <>
      <QuotationViewSection
        editLabel="Edit invoice terms"
        icon={ScrollText}
        onEdit={() => setEditOpen(true)}
        title="Invoice terms"
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