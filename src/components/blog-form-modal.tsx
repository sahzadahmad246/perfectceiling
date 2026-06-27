"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createBlogPost,
  updateBlogPost,
  type BlogActionResult,
} from "@/app/admin/blog/actions";
import { AdminFormDraftPrompt } from "@/components/admin-form-draft-prompt";
import { BlogContentStep } from "@/components/blog-content-step";
import { BlogPreviewStep } from "@/components/blog-preview-step";
import { BlogSeoStep } from "@/components/blog-seo-step";
import {
  clearAdminFormDraft,
  getAdminFormDraftKey,
  loadAdminFormDraft,
  saveAdminFormDraft,
  type AdminFormDraft,
} from "@/lib/admin-form-drafts";
import {
  emptyBlogForm,
  ensureUniqueBlogSlug,
  hasBlogDraftContent,
  slugifyBlogTitle,
  type BlogFormInput,
} from "@/lib/blog";

type BlogFormModalProps = {
  open: boolean;
  onClose: () => void;
  postId?: string;
  initialData?: BlogFormInput;
  existingSlugs: string[];
  onSaved?: () => void;
};

type BlogFieldErrors = {
  title?: string;
  excerpt?: string;
};

export function BlogFormModal({
  open,
  onClose,
  postId,
  initialData,
  existingSlugs,
  onSaved,
}: BlogFormModalProps) {
  const isEditing = Boolean(postId && initialData);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BlogFormInput>(emptyBlogForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<BlogFieldErrors>({});
  const [pendingDraft, setPendingDraft] =
    useState<AdminFormDraft<BlogFormInput> | null>(null);
  const [isPending, startTransition] = useTransition();

  const draftKey = useMemo(
    () =>
      getAdminFormDraftKey("blog", isEditing ? "edit" : "create", postId),
    [isEditing, postId],
  );

  const originalSlug = useMemo(
    () => (initialData?.slug ? slugifyBlogTitle(initialData.slug) : undefined),
    [initialData?.slug],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPendingDraft(null);
      return;
    }

    const draft = loadAdminFormDraft<BlogFormInput>(draftKey);

    setStep(1);
    setErrors({});

    if (draft && hasBlogDraftContent(draft.form)) {
      setPendingDraft(draft);
      setForm(emptyBlogForm());
      setSlugTouched(false);
      return;
    }

    setPendingDraft(null);
    setForm(initialData ?? emptyBlogForm());
    setSlugTouched(Boolean(initialData?.slug));
  }, [draftKey, initialData, open]);

  useEffect(() => {
    if (!open || pendingDraft) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (hasBlogDraftContent(form)) {
        saveAdminFormDraft(draftKey, form, {
          step,
          slugTouched,
        });
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [draftKey, form, open, pendingDraft, slugTouched, step]);

  useEffect(() => {
    if (!open || slugTouched) {
      return;
    }

    const nextSlug = ensureUniqueBlogSlug(
      form.title,
      existingSlugs,
      originalSlug,
    );

    if (nextSlug !== form.slug) {
      setForm((current) => ({ ...current, slug: nextSlug }));
    }
  }, [existingSlugs, form.slug, form.title, open, originalSlug, slugTouched]);

  if (!open) {
    return null;
  }

  function handleClose() {
    if (!pendingDraft && hasBlogDraftContent(form)) {
      saveAdminFormDraft(draftKey, form, {
        step,
        slugTouched,
      });
    }

    onClose();
  }

  function handleRestoreDraft() {
    if (!pendingDraft) {
      return;
    }

    setForm(pendingDraft.form);
    setStep(Number(pendingDraft.meta?.step ?? 1));
    setSlugTouched(Boolean(pendingDraft.meta?.slugTouched));
    setPendingDraft(null);
  }

  function handleDiscardDraft() {
    clearAdminFormDraft(draftKey);
    setPendingDraft(null);
    setStep(1);
    setForm(initialData ?? emptyBlogForm());
    setSlugTouched(Boolean(initialData?.slug));
  }

  function updateField<K extends keyof BlogFormInput>(
    key: K,
    value: BlogFormInput[K],
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "title" && !slugTouched) {
        next.slug = ensureUniqueBlogSlug(
          String(value),
          existingSlugs,
          originalSlug,
        );
      }

      return next;
    });

    if (key === "title") {
      setErrors((current) => ({ ...current, title: undefined }));
    }

    if (key === "excerpt") {
      setErrors((current) => ({ ...current, excerpt: undefined }));
    }
  }

  function validateStep(currentStep: number) {
    if (currentStep === 1) {
      const nextErrors: BlogFieldErrors = {};

      if (!form.title.trim()) {
        nextErrors.title = "Article title is required.";
      }

      if (!form.excerpt.trim()) {
        nextErrors.excerpt = "Excerpt is required.";
      }

      if (!form.slug.trim()) {
        toast.error("Enter a valid article title to generate a slug.");
        return false;
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return false;
      }

      setErrors({});
    }

    return true;
  }

  function handleSubmit() {
    startTransition(async () => {
      let result: BlogActionResult;

      if (isEditing && postId) {
        result = await updateBlogPost(postId, form);
      } else {
        result = await createBlogPost(form);
      }

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      clearAdminFormDraft(draftKey);
      toast.success(isEditing ? "Article updated." : "Article created.");
      onSaved?.();
      onClose();
    });
  }

  const stepTitle =
    step === 1
      ? isEditing
        ? "Edit article content"
        : "Article content"
      : step === 2
        ? isEditing
          ? "Edit publish settings"
          : "Search & publish"
        : isEditing
          ? "Review changes"
          : "Preview";

  return (
    <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-[560px] flex-col border-x border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3 sm:px-8">
          <div>
            <div className="text-xs text-muted">Step {step} of 3</div>
            <h2 className="font-primary text-lg font-medium">{stepTitle}</h2>
          </div>
          <button
            aria-label="Close blog form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            disabled={isPending}
            onClick={handleClose}
            type="button"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8">
          {pendingDraft ? (
            <AdminFormDraftPrompt
              onDiscard={handleDiscardDraft}
              onRestore={handleRestoreDraft}
              savedAt={pendingDraft.savedAt}
            />
          ) : null}

          {!pendingDraft && step === 1 ? (
            <BlogContentStep
              errors={errors}
              form={form}
              onChange={updateField}
              onSlugTouchedChange={setSlugTouched}
              slugTouched={slugTouched}
            />
          ) : null}

          {!pendingDraft && step === 2 ? (
            <BlogSeoStep form={form} onChange={updateField} />
          ) : null}

          {!pendingDraft && step === 3 ? (
            <BlogPreviewStep form={form} onGoToStep={setStep} />
          ) : null}
        </div>

        <footer className="border-t border-border-soft px-4 py-3 sm:px-8">
          <div className="flex gap-2">
            {step > 1 ? (
              <button
                className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium disabled:opacity-70"
                disabled={isPending}
                onClick={() => setStep((current) => current - 1)}
                type="button"
              >
                Back
              </button>
            ) : (
              <button
                className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium"
                disabled={isPending}
                onClick={handleClose}
                type="button"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                className="h-11 flex-1 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
                disabled={isPending || Boolean(pendingDraft)}
                onClick={() => {
                  if (validateStep(step)) {
                    setStep((current) => current + 1);
                  }
                }}
                type="button"
              >
                Next
              </button>
            ) : (
              <button
                aria-busy={isPending}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
                disabled={isPending || Boolean(pendingDraft)}
                onClick={handleSubmit}
                type="button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {isEditing ? "Saving..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Save article"
                ) : (
                  "Create article"
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}