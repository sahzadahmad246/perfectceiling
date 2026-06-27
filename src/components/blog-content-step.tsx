"use client";

import {
  AlignLeft,
  FileText,
  Link2,
  Pencil,
  Tag,
  Type,
} from "lucide-react";
import { useState } from "react";

import { QuotationFormField } from "@/components/quotation-form-field";
import { ServiceContentEditorModal } from "@/components/service-content-editor-modal";
import {
  BLOG_CATEGORIES,
  getBlogContentPreview,
  getBlogPublicPath,
  isBlogContentEmpty,
  slugifyBlogTitle,
  type BlogFormInput,
} from "@/lib/blog";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary";

const textareaClass =
  "mt-2 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

type BlogFieldErrors = {
  title?: string;
  excerpt?: string;
};

type BlogContentStepProps = {
  form: BlogFormInput;
  errors: BlogFieldErrors;
  slugTouched: boolean;
  onSlugTouchedChange: (touched: boolean) => void;
  onChange: <K extends keyof BlogFormInput>(
    key: K,
    value: BlogFormInput[K],
  ) => void;
};

export function BlogContentStep({
  form,
  errors,
  slugTouched,
  onSlugTouchedChange,
  onChange,
}: BlogContentStepProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [slugEditing, setSlugEditing] = useState(slugTouched);
  const contentPreview = getBlogContentPreview(form.content);
  const hasContent = !isBlogContentEmpty(form.content);

  return (
    <>
      <QuotationFormField error={errors.title} icon={Type} label="Title" required>
        <input
          aria-invalid={Boolean(errors.title)}
          className={cn(
            inputClass,
            errors.title && "border-rose-400 focus:border-rose-500",
          )}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="POP false ceiling cost guide"
          value={form.title}
        />
        <p className="mt-2 text-xs leading-5 text-muted">
          Used as the page title and SEO title on Google.
        </p>
      </QuotationFormField>

      <QuotationFormField icon={Link2} label="URL slug" optional>
        {slugEditing ? (
          <input
            className={inputClass}
            onChange={(event) => {
              onSlugTouchedChange(true);
              onChange("slug", slugifyBlogTitle(event.target.value));
            }}
            placeholder="pop-false-ceiling-cost"
            value={form.slug}
          />
        ) : (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-border-soft bg-surface-muted/50 px-3 py-2.5">
            <p className="min-w-0 truncate text-sm text-foreground">
              {form.slug ? getBlogPublicPath(form.slug) : "Generated from title"}
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
          Auto-generated from the title and kept unique across articles.
        </p>
      </QuotationFormField>

      <QuotationFormField
        error={errors.excerpt}
        icon={AlignLeft}
        label="Excerpt"
        required
      >
        <textarea
          aria-invalid={Boolean(errors.excerpt)}
          className={cn(
            textareaClass,
            "min-h-[5rem] resize-y",
            errors.excerpt && "border-rose-400 focus:border-rose-500",
          )}
          onChange={(event) => onChange("excerpt", event.target.value)}
          placeholder="A short summary for blog cards and the Google search description."
          value={form.excerpt}
        />
      </QuotationFormField>

      <QuotationFormField icon={Tag} label="Category" optional>
        <input
          className={inputClass}
          list="blog-category-suggestions"
          onChange={(event) => onChange("category", event.target.value)}
          placeholder="Cost guide"
          value={form.category}
        />
        <datalist id="blog-category-suggestions">
          {BLOG_CATEGORIES.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </QuotationFormField>

      <QuotationFormField icon={FileText} label="Article content" optional>
        <button
          className="mt-2 w-full rounded-xl border border-border-soft bg-surface-raised/60 p-4 text-left transition hover:border-border-strong hover:bg-surface-muted/60"
          onClick={() => setEditorOpen(true)}
          type="button"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {hasContent ? "Edit article content" : "Write article content"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {hasContent
                  ? contentPreview
                  : "Open the editor to write the article and add images inline."}
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