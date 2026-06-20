"use client";

import { Globe, Hash, Search, StickyNote } from "lucide-react";

import { QuotationFormField } from "@/components/quotation-form-field";
import type { ServiceFormInput } from "@/lib/services";

const inputClass =
  "mt-2 h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary";

const textareaClass =
  "mt-2 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

type ServiceSeoStepProps = {
  form: ServiceFormInput;
  onChange: <K extends keyof ServiceFormInput>(
    key: K,
    value: ServiceFormInput[K],
  ) => void;
};

export function ServiceSeoStep({ form, onChange }: ServiceSeoStepProps) {
  const resolvedSeoTitle = form.seoTitle.trim() || form.title.trim();
  const resolvedSeoDescription =
    form.seoDescription.trim() || form.shortDescription.trim();

  return (
    <>
      <section className="mb-5 rounded-xl border border-border-soft bg-surface-muted/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="text-muted" size={16} />
          <span>Search preview</span>
        </div>
        <div className="mt-3 rounded-lg border border-border-soft bg-surface px-3 py-3">
          <p className="truncate text-sm text-[#1a0dab]">
            {resolvedSeoTitle || "SEO title preview"}
          </p>
          <p className="mt-1 truncate text-xs text-[#006621]">
            yoursite.com/services/{form.slug || "service-slug"}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#545454]">
            {resolvedSeoDescription || "Meta description preview"}
          </p>
        </div>
      </section>

      <QuotationFormField icon={Globe} label="SEO title" optional>
        <input
          className={inputClass}
          onChange={(event) => onChange("seoTitle", event.target.value)}
          placeholder={form.title || "POP False Ceiling Contractor in Your City"}
          value={form.seoTitle}
        />
        <p className="mt-2 text-xs leading-5 text-muted">
          Defaults to the service title when left empty.
        </p>
      </QuotationFormField>

      <QuotationFormField icon={StickyNote} label="Meta description" optional>
        <textarea
          className={`${textareaClass} min-h-[6rem] resize-y`}
          onChange={(event) => onChange("seoDescription", event.target.value)}
          placeholder={
            form.shortDescription ||
            "Measured POP false ceiling work for homes, shops, offices, and halls."
          }
          value={form.seoDescription}
        />
        <p className="mt-2 text-xs leading-5 text-muted">
          Defaults to the short description when left empty.
        </p>
      </QuotationFormField>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <QuotationFormField compact icon={Hash} label="Sort order" optional>
          <input
            className={inputClass}
            inputMode="numeric"
            onChange={(event) => onChange("sortOrder", event.target.value)}
            value={form.sortOrder}
          />
        </QuotationFormField>

        <QuotationFormField compact icon={Globe} label="Visibility" optional>
          <label className="mt-2 flex h-11 w-full items-center gap-3 rounded-md border border-border-strong bg-surface px-3 text-sm">
            <input
              checked={form.published}
              className="size-4 accent-primary"
              onChange={(event) => onChange("published", event.target.checked)}
              type="checkbox"
            />
            Published on website
          </label>
        </QuotationFormField>
      </div>
    </>
  );
}