"use client";

import { Globe, Receipt, Type } from "lucide-react";

import {
  QuotationViewDivider,
  QuotationViewLabelValue,
  QuotationViewSection,
} from "@/components/quotation-view-primitives";
import {
  formatServiceRate,
  getServicePublicPath,
  isServiceContentEmpty,
  type ServiceFormInput,
  type ServiceRateUnit,
} from "@/lib/services";

type ServicePreviewStepProps = {
  form: ServiceFormInput;
  onGoToStep: (step: number) => void;
};

function parsePreviewPrice(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed.replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

export function ServicePreviewStep({ form, onGoToStep }: ServicePreviewStepProps) {
  const startingPrice = parsePreviewPrice(form.startingPrice);
  const rateUnit = (form.rateUnit || null) as ServiceRateUnit | null;
  const resolvedSeoTitle = form.seoTitle.trim() || form.title.trim();
  const resolvedSeoDescription =
    form.seoDescription.trim() || form.shortDescription.trim();
  const hasContent = !isServiceContentEmpty(form.content);

  return (
    <>
      <section className="mt-1">
        <h2 className="font-primary text-xl font-medium text-foreground">
          {form.title.trim() || "Untitled service"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {formatServiceRate(startingPrice, rateUnit)}
        </p>
        {form.shortDescription.trim() ? (
          <p className="mt-3 text-sm leading-7 text-foreground">
            {form.shortDescription}
          </p>
        ) : null}
      </section>

      <QuotationViewSection
        editLabel="Edit service content"
        icon={Type}
        onEdit={() => onGoToStep(1)}
        title="Service content"
      >
        <QuotationViewLabelValue label="Title" value={form.title} />
        <QuotationViewDivider />
        <QuotationViewLabelValue
          label="URL"
          value={form.slug ? getServicePublicPath(form.slug) : ""}
        />
        <QuotationViewDivider />
        <QuotationViewLabelValue
          label="Short description"
          value={form.shortDescription}
        />
        <QuotationViewDivider />
        <QuotationViewLabelValue
          label="Starting price"
          value={
            startingPrice !== null
              ? formatServiceRate(startingPrice, rateUnit)
              : "Rate on request"
          }
        />
        <QuotationViewDivider />
        <div>
          <p className="text-xs text-muted">Page content</p>
          {hasContent ? (
            <div
              className="article-editor-preview mt-2 text-sm leading-7 text-foreground"
              dangerouslySetInnerHTML={{ __html: form.content }}
            />
          ) : (
            <p className="mt-1 text-sm text-muted">No page content added yet.</p>
          )}
        </div>
      </QuotationViewSection>

      <QuotationViewSection
        editLabel="Edit SEO"
        icon={Globe}
        onEdit={() => onGoToStep(2)}
        title="SEO & visibility"
      >
        <QuotationViewLabelValue label="SEO title" value={resolvedSeoTitle} />
        <QuotationViewDivider />
        <QuotationViewLabelValue
          label="Meta description"
          value={resolvedSeoDescription}
        />
        <QuotationViewDivider />
        <QuotationViewLabelValue label="Sort order" value={form.sortOrder} />
        <QuotationViewDivider />
        <QuotationViewLabelValue
          label="Published"
          value={form.published ? "Yes — visible on website" : "No — draft only"}
        />
      </QuotationViewSection>

      <section className="mt-4 rounded-xl border border-border-soft bg-surface-muted/40 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Receipt className="text-muted" size={16} />
          <span>Google preview</span>
        </div>
        <div className="mt-3 rounded-lg border border-border-soft bg-surface px-3 py-3">
          <p className="truncate text-sm text-[#1a0dab]">
            {resolvedSeoTitle || "SEO title"}
          </p>
          <p className="mt-1 truncate text-xs text-[#006621]">
            yoursite.com{form.slug ? getServicePublicPath(form.slug) : "/services/..."}
          </p>
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#545454]">
            {resolvedSeoDescription || "Meta description"}
          </p>
        </div>
      </section>
    </>
  );
}