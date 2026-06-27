"use client";

import { Globe, Search } from "lucide-react";

import { QuotationFormField } from "@/components/quotation-form-field";
import { getBlogPublicPath, type BlogFormInput } from "@/lib/blog";

type BlogSeoStepProps = {
  form: BlogFormInput;
  onChange: <K extends keyof BlogFormInput>(
    key: K,
    value: BlogFormInput[K],
  ) => void;
};

export function BlogSeoStep({ form, onChange }: BlogSeoStepProps) {
  return (
    <>
      <section className="mb-5 rounded-xl border border-border-soft bg-surface-muted/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="text-muted" size={16} />
          <span>Search preview</span>
        </div>
        <div className="mt-3 rounded-lg border border-border-soft bg-surface px-3 py-3">
          <p className="truncate text-sm text-[#1a0dab]">
            {form.title.trim() || "Article title"}
          </p>
          <p className="mt-1 truncate text-xs text-[#006621]">
            yoursite.com{getBlogPublicPath(form.slug || "article-slug")}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#545454]">
            {form.excerpt.trim() || "Excerpt preview"}
          </p>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">
          Title and excerpt from step 1 are used for SEO automatically.
        </p>
      </section>

      <QuotationFormField icon={Globe} label="Visibility" optional>
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
    </>
  );
}