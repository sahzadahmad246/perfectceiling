"use client";

import { Globe, Type } from "lucide-react";

import {
  QuotationViewDivider,
  QuotationViewLabelValue,
  QuotationViewSection,
} from "@/components/quotation-view-primitives";
import {
  getBlogPublicPath,
  isBlogContentEmpty,
  type BlogFormInput,
} from "@/lib/blog";

type BlogPreviewStepProps = {
  form: BlogFormInput;
  onGoToStep: (step: number) => void;
};

export function BlogPreviewStep({ form, onGoToStep }: BlogPreviewStepProps) {
  const hasContent = !isBlogContentEmpty(form.content);

  return (
    <>
      <section className="mt-1">
        {form.category.trim() ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {form.category}
          </p>
        ) : null}
        <h2 className="font-primary text-xl font-medium text-foreground">
          {form.title.trim() || "Untitled article"}
        </h2>
        {form.excerpt.trim() ? (
          <p className="mt-3 text-sm leading-7 text-foreground">{form.excerpt}</p>
        ) : null}
      </section>

      <QuotationViewSection
        editLabel="Edit article"
        icon={Type}
        onEdit={() => onGoToStep(1)}
        title="Article"
      >
        <QuotationViewLabelValue label="Title" value={form.title} />
        <QuotationViewDivider />
        <QuotationViewLabelValue
          label="URL"
          value={form.slug ? getBlogPublicPath(form.slug) : ""}
        />
        <QuotationViewDivider />
        <QuotationViewLabelValue label="Excerpt" value={form.excerpt} />
        <QuotationViewDivider />
        <QuotationViewLabelValue label="Category" value={form.category} />
        <QuotationViewDivider />
        <QuotationViewLabelValue
          label="Article body"
          value={hasContent ? "Content added" : "No content yet"}
        />
      </QuotationViewSection>

      <QuotationViewSection
        editLabel="Edit publish settings"
        icon={Globe}
        onEdit={() => onGoToStep(2)}
        title="Search & publish"
      >
        <QuotationViewLabelValue label="Search title" value={form.title} />
        <QuotationViewDivider />
        <QuotationViewLabelValue label="Search description" value={form.excerpt} />
        <QuotationViewDivider />
        <QuotationViewLabelValue
          label="Published"
          value={form.published ? "Yes" : "Draft"}
        />
      </QuotationViewSection>
    </>
  );
}