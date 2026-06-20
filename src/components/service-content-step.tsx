"use client";

import {
  AlignLeft,
  CircleDollarSign,
  FileText,
  Link2,
  Pencil,
  Type,
} from "lucide-react";
import { useState } from "react";

import { QuotationFormField } from "@/components/quotation-form-field";
import { ServiceContentEditorModal } from "@/components/service-content-editor-modal";
import {
  getServiceContentPreview,
  getServicePublicPath,
  isServiceContentEmpty,
  SERVICE_RATE_UNITS,
  slugifyServiceTitle,
  type ServiceFormInput,
} from "@/lib/services";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary";

const textareaClass =
  "mt-2 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

type ServiceFieldErrors = {
  title?: string;
  shortDescription?: string;
};

type ServiceContentStepProps = {
  form: ServiceFormInput;
  errors: ServiceFieldErrors;
  slugTouched: boolean;
  onSlugTouchedChange: (touched: boolean) => void;
  onChange: <K extends keyof ServiceFormInput>(
    key: K,
    value: ServiceFormInput[K],
  ) => void;
};

export function ServiceContentStep({
  form,
  errors,
  slugTouched,
  onSlugTouchedChange,
  onChange,
}: ServiceContentStepProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [slugEditing, setSlugEditing] = useState(slugTouched);
  const contentPreview = getServiceContentPreview(form.content);
  const hasContent = !isServiceContentEmpty(form.content);

  return (
    <>
      <QuotationFormField error={errors.title} icon={Type} label="Service title" required>
        <input
          aria-invalid={Boolean(errors.title)}
          className={cn(
            inputClass,
            errors.title && "border-rose-400 focus:border-rose-500",
          )}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="POP false ceiling"
          value={form.title}
        />
      </QuotationFormField>

      <QuotationFormField icon={Link2} label="URL slug" optional>
        {slugEditing ? (
          <input
            className={inputClass}
            onChange={(event) => {
              onSlugTouchedChange(true);
              onChange("slug", slugifyServiceTitle(event.target.value));
            }}
            placeholder="pop-false-ceiling"
            value={form.slug}
          />
        ) : (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-border-soft bg-surface-muted/50 px-3 py-2.5">
            <p className="min-w-0 truncate text-sm text-foreground">
              {form.slug ? getServicePublicPath(form.slug) : "Generated from title"}
            </p>
            <button
              className="shrink-0 text-xs font-medium text-primary transition hover:text-primary-hover"
              onClick={() => {
                setSlugEditing(true);
                onSlugTouchedChange(true);
              }}
              type="button"
            >
              Edit
            </button>
          </div>
        )}
        <p className="mt-2 text-xs leading-5 text-muted">
          Auto-generated from the title and kept unique across services.
        </p>
      </QuotationFormField>

      <QuotationFormField
        error={errors.shortDescription}
        icon={AlignLeft}
        label="Short description"
        required
      >
        <textarea
          aria-invalid={Boolean(errors.shortDescription)}
          className={cn(
            textareaClass,
            "min-h-[6rem] resize-y",
            errors.shortDescription && "border-rose-400 focus:border-rose-500",
          )}
          onChange={(event) => onChange("shortDescription", event.target.value)}
          placeholder="Custom POP false ceiling designs for homes, shops, and offices."
          value={form.shortDescription}
        />
      </QuotationFormField>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <QuotationFormField compact icon={CircleDollarSign} label="Starting price" optional>
          <input
            className={inputClass}
            inputMode="decimal"
            onChange={(event) => onChange("startingPrice", event.target.value)}
            placeholder="80"
            value={form.startingPrice}
          />
        </QuotationFormField>

        <QuotationFormField compact icon={CircleDollarSign} label="Rate unit" optional>
          <select
            className={inputClass}
            onChange={(event) =>
              onChange(
                "rateUnit",
                event.target.value as ServiceFormInput["rateUnit"],
              )
            }
            value={form.rateUnit}
          >
            <option value="">Select unit</option>
            {SERVICE_RATE_UNITS.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </select>
        </QuotationFormField>
      </div>

      <QuotationFormField icon={FileText} label="Page content" optional>
        <button
          className="mt-2 w-full rounded-xl border border-border-soft bg-surface-raised/60 p-4 text-left transition hover:border-border-strong hover:bg-surface-muted/60"
          onClick={() => setEditorOpen(true)}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {hasContent ? "Edit page content" : "Write page content"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {hasContent
                  ? contentPreview
                  : "Open the article editor to write the full public service page."}
              </p>
            </div>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted">
              <Pencil size={15} />
            </span>
          </div>
        </button>
      </QuotationFormField>

      <ServiceContentEditorModal
        initialContent={form.content}
        onClose={() => setEditorOpen(false)}
        onSave={(content) => onChange("content", content)}
        open={editorOpen}
        title={form.title}
      />
    </>
  );
}