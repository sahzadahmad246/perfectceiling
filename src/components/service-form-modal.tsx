"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createService,
  updateService,
  type ServiceActionResult,
} from "@/app/admin/services/actions";
import { AdminFormDraftPrompt } from "@/components/admin-form-draft-prompt";
import { ServiceContentStep } from "@/components/service-content-step";
import { ServicePreviewStep } from "@/components/service-preview-step";
import { ServiceSeoStep } from "@/components/service-seo-step";
import {
  clearAdminFormDraft,
  getAdminFormDraftKey,
  loadAdminFormDraft,
  saveAdminFormDraft,
  type AdminFormDraft,
} from "@/lib/admin-form-drafts";
import {
  emptyServiceForm,
  ensureUniqueServiceSlug,
  hasServiceDraftContent,
  slugifyServiceTitle,
  type ServiceFormInput,
} from "@/lib/services";

type ServiceFormModalProps = {
  open: boolean;
  onClose: () => void;
  serviceId?: string;
  initialData?: ServiceFormInput;
  existingSlugs: string[];
  onSaved?: () => void;
};

type ServiceFieldErrors = {
  title?: string;
  shortDescription?: string;
};

export function ServiceFormModal({
  open,
  onClose,
  serviceId,
  initialData,
  existingSlugs,
  onSaved,
}: ServiceFormModalProps) {
  const isEditing = Boolean(serviceId && initialData);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ServiceFormInput>(emptyServiceForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<ServiceFieldErrors>({});
  const [pendingDraft, setPendingDraft] =
    useState<AdminFormDraft<ServiceFormInput> | null>(null);
  const [isPending, startTransition] = useTransition();

  const draftKey = useMemo(
    () =>
      getAdminFormDraftKey(
        "service",
        isEditing ? "edit" : "create",
        serviceId,
      ),
    [isEditing, serviceId],
  );

  const originalSlug = useMemo(
    () => (initialData?.slug ? slugifyServiceTitle(initialData.slug) : undefined),
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

    const draft = loadAdminFormDraft<ServiceFormInput>(draftKey);

    setStep(1);
    setErrors({});

    if (draft && hasServiceDraftContent(draft.form)) {
      setPendingDraft(draft);
      setForm(emptyServiceForm());
      setSlugTouched(false);
      return;
    }

    setPendingDraft(null);
    setForm(initialData ?? emptyServiceForm());
    setSlugTouched(Boolean(initialData?.slug));
  }, [draftKey, initialData, open]);

  useEffect(() => {
    if (!open || pendingDraft) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (hasServiceDraftContent(form)) {
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

    const nextSlug = ensureUniqueServiceSlug(
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
    if (!pendingDraft && hasServiceDraftContent(form)) {
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
    setForm(initialData ?? emptyServiceForm());
    setSlugTouched(Boolean(initialData?.slug));
  }

  function updateField<K extends keyof ServiceFormInput>(
    key: K,
    value: ServiceFormInput[K],
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "title" && !slugTouched) {
        next.slug = ensureUniqueServiceSlug(
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

    if (key === "shortDescription") {
      setErrors((current) => ({ ...current, shortDescription: undefined }));
    }
  }

  function validateStep(currentStep: number) {
    if (currentStep === 1) {
      const nextErrors: ServiceFieldErrors = {};

      if (!form.title.trim()) {
        nextErrors.title = "Service title is required.";
      }

      if (!form.shortDescription.trim()) {
        nextErrors.shortDescription = "Short description is required.";
      }

      if (!form.slug.trim()) {
        toast.error("Enter a valid service title to generate a slug.");
        return false;
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return false;
      }

      setErrors({});
    }

    if (currentStep === 2) {
      if (form.startingPrice.trim()) {
        const parsed = Number.parseFloat(form.startingPrice.replace(/,/g, ""));

        if (!Number.isFinite(parsed) || parsed < 0) {
          toast.error("Enter a valid starting price or leave it empty.");
          return false;
        }
      }
    }

    return true;
  }

  function handleSubmit() {
    startTransition(async () => {
      let result: ServiceActionResult;

      if (isEditing && serviceId) {
        result = await updateService(serviceId, form);
      } else {
        result = await createService(form);
      }

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      clearAdminFormDraft(draftKey);
      toast.success(isEditing ? "Service updated." : "Service created.");
      onSaved?.();
      onClose();
    });
  }

  const stepTitle =
    step === 1
      ? isEditing
        ? "Edit service content"
        : "Service content"
      : step === 2
        ? isEditing
          ? "Edit SEO data"
          : "SEO data"
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
            aria-label="Close service form"
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
            <ServiceContentStep
              errors={errors}
              form={form}
              onChange={updateField}
              onSlugTouchedChange={setSlugTouched}
              slugTouched={slugTouched}
            />
          ) : null}

          {!pendingDraft && step === 2 ? (
            <ServiceSeoStep form={form} onChange={updateField} />
          ) : null}

          {!pendingDraft && step === 3 ? (
            <ServicePreviewStep form={form} onGoToStep={setStep} />
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
                  "Save service"
                ) : (
                  "Create service"
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}