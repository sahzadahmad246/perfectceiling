"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createService,
  updateService,
  type ServiceActionResult,
} from "@/app/admin/services/actions";
import {
  emptyServiceForm,
  SERVICE_RATE_UNITS,
  slugifyServiceTitle,
  type ServiceFormInput,
} from "@/lib/services";

type ServiceFormModalProps = {
  open: boolean;
  onClose: () => void;
  serviceId?: string;
  initialData?: ServiceFormInput;
  onSaved?: () => void;
};

const fieldClass =
  "mt-2 h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary";

const textareaClass =
  "mt-2 min-h-[7rem] w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function ServiceFormModal({
  open,
  onClose,
  serviceId,
  initialData,
  onSaved,
}: ServiceFormModalProps) {
  const isEditing = Boolean(serviceId && initialData);
  const [form, setForm] = useState<ServiceFormInput>(emptyServiceForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      return;
    }

    setForm(initialData ?? emptyServiceForm());
    setSlugTouched(Boolean(initialData?.slug));
  }, [initialData, open]);

  if (!open) {
    return null;
  }

  function updateField<K extends keyof ServiceFormInput>(
    key: K,
    value: ServiceFormInput[K],
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "title" && !slugTouched) {
        next.slug = slugifyServiceTitle(String(value));
      }

      return next;
    });
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

      toast.success(isEditing ? "Service updated." : "Service created.");
      onSaved?.();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-[560px] flex-col border-x border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3 sm:px-8">
          <div>
            <p className="text-xs text-muted">
              {isEditing ? "Edit service" : "New service"}
            </p>
            <h2 className="font-primary text-lg font-medium">
              {isEditing ? "Update service details" : "Add a service"}
            </h2>
          </div>
          <button
            aria-label="Close service form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8">
          <div className="space-y-5">
            <section>
              <FieldLabel>Title</FieldLabel>
              <input
                className={fieldClass}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="POP false ceiling"
                value={form.title}
              />
            </section>

            <section>
              <FieldLabel hint="Used in the public URL, e.g. /services/pop-false-ceiling">
                Slug
              </FieldLabel>
              <input
                className={fieldClass}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateField("slug", slugifyServiceTitle(event.target.value));
                }}
                placeholder="pop-false-ceiling"
                value={form.slug}
              />
            </section>

            <section>
              <FieldLabel hint="Shown on cards and search snippets">
                Short description
              </FieldLabel>
              <textarea
                className={textareaClass}
                onChange={(event) =>
                  updateField("shortDescription", event.target.value)
                }
                placeholder="Custom POP false ceiling designs for homes, shops, and offices."
                value={form.shortDescription}
              />
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel hint="Optional">Starting price</FieldLabel>
                <input
                  className={fieldClass}
                  inputMode="decimal"
                  onChange={(event) =>
                    updateField("startingPrice", event.target.value)
                  }
                  placeholder="80"
                  value={form.startingPrice}
                />
              </div>
              <div>
                <FieldLabel hint="Optional">Rate unit</FieldLabel>
                <select
                  className={fieldClass}
                  onChange={(event) =>
                    updateField(
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
              </div>
            </section>

            <section>
              <FieldLabel hint="Full page content for the public SEO page later">
                Page content
              </FieldLabel>
              <textarea
                className={`${textareaClass} min-h-[10rem]`}
                onChange={(event) => updateField("content", event.target.value)}
                placeholder="Explain the service, benefits, process, and what customers can expect."
                value={form.content}
              />
            </section>

            <section className="rounded-xl border border-border-soft bg-surface-muted/70 p-4">
              <p className="text-sm font-medium text-foreground">SEO</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                These fields help the public service page rank on Google.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <FieldLabel hint="Defaults to title if empty">SEO title</FieldLabel>
                  <input
                    className={fieldClass}
                    onChange={(event) =>
                      updateField("seoTitle", event.target.value)
                    }
                    placeholder="POP False Ceiling Contractor in Your City"
                    value={form.seoTitle}
                  />
                </div>
                <div>
                  <FieldLabel hint="Defaults to short description if empty">
                    Meta description
                  </FieldLabel>
                  <textarea
                    className={textareaClass}
                    onChange={(event) =>
                      updateField("seoDescription", event.target.value)
                    }
                    placeholder="Measured POP false ceiling work for homes, shops, offices, and halls."
                    value={form.seoDescription}
                  />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel hint="Lower shows first">Sort order</FieldLabel>
                <input
                  className={fieldClass}
                  inputMode="numeric"
                  onChange={(event) =>
                    updateField("sortOrder", event.target.value)
                  }
                  value={form.sortOrder}
                />
              </div>
              <div className="flex items-end">
                <label className="flex h-11 w-full items-center gap-3 rounded-md border border-border-strong bg-surface px-3 text-sm">
                  <input
                    checked={form.published}
                    className="size-4 accent-primary"
                    onChange={(event) =>
                      updateField("published", event.target.checked)
                    }
                    type="checkbox"
                  />
                  Published on website
                </label>
              </div>
            </section>
          </div>
        </div>

        <footer className="border-t border-border-soft px-4 py-4 sm:px-8">
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-70"
            disabled={isPending}
            onClick={handleSubmit}
            type="button"
          >
            {isPending ? <Loader2 className="animate-spin" size={16} /> : null}
            {isEditing ? "Save service" : "Create service"}
          </button>
        </footer>
      </div>
    </div>
  );
}