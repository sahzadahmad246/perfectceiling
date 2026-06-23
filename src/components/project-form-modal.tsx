"use client";

import { ImageUp, Loader2, Pencil, Star, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createProject,
  deleteProjectImage,
  updateProject,
  uploadProjectImage,
  type ProjectActionResult,
} from "@/app/admin/projects/actions";
import { AdminFormDraftPrompt } from "@/components/admin-form-draft-prompt";
import { ServiceContentEditorModal } from "@/components/service-content-editor-modal";
import {
  clearAdminFormDraft,
  getAdminFormDraftKey,
  loadAdminFormDraft,
  saveAdminFormDraft,
  type AdminFormDraft,
} from "@/lib/admin-form-drafts";
import {
  emptyProjectForm,
  ensureUniqueProjectSlug,
  hasProjectDraftContent,
  PROJECT_SERVICE_SUGGESTIONS,
  PROJECT_STATUSES,
  slugifyProjectTitle,
  type ProjectFormInput,
  type ProjectImageDraft,
} from "@/lib/projects";
import {
  getServiceContentPreview,
  isServiceContentEmpty,
} from "@/lib/services";

type ProjectFormModalProps = {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  initialData?: ProjectFormInput;
  existingSlugs: string[];
  onSaved?: () => void;
};

export function ProjectFormModal({
  open,
  onClose,
  projectId,
  initialData,
  existingSlugs,
  onSaved,
}: ProjectFormModalProps) {
  const isEditing = Boolean(projectId && initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProjectFormInput>(emptyProjectForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingDraft, setPendingDraft] =
    useState<AdminFormDraft<ProjectFormInput> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [storageKey, setStorageKey] = useState(
    () => projectId ?? crypto.randomUUID(),
  );
  const descriptionPreview = getServiceContentPreview(form.description);
  const hasDescription = !isServiceContentEmpty(form.description);

  const draftKey = useMemo(
    () =>
      getAdminFormDraftKey(
        "project",
        isEditing ? "edit" : "create",
        projectId,
      ),
    [isEditing, projectId],
  );

  const originalSlug = useMemo(
    () => (initialData?.slug ? slugifyProjectTitle(initialData.slug) : undefined),
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

    const draft = loadAdminFormDraft<ProjectFormInput>(draftKey);

    if (draft && hasProjectDraftContent(draft.form)) {
      setPendingDraft(draft);
      setForm(emptyProjectForm());
      setSlugTouched(false);
      return;
    }

    setPendingDraft(null);
    setForm(initialData ?? emptyProjectForm());
    setSlugTouched(Boolean(initialData?.slug));
    setStorageKey(projectId ?? crypto.randomUUID());
  }, [draftKey, initialData, open, projectId]);

  useEffect(() => {
    if (!open || pendingDraft) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (hasProjectDraftContent(form)) {
        saveAdminFormDraft(draftKey, form, {
          slugTouched,
          storageKey,
        });
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [draftKey, form, open, pendingDraft, slugTouched, storageKey]);

  useEffect(() => {
    if (!open || slugTouched) {
      return;
    }

    const nextSlug = ensureUniqueProjectSlug(
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
    if (!pendingDraft && hasProjectDraftContent(form)) {
      saveAdminFormDraft(draftKey, form, {
        slugTouched,
        storageKey,
      });
    }

    onClose();
  }

  function handleRestoreDraft() {
    if (!pendingDraft) {
      return;
    }

    setForm(pendingDraft.form);
    setSlugTouched(Boolean(pendingDraft.meta?.slugTouched));

    if (pendingDraft.meta?.storageKey) {
      setStorageKey(String(pendingDraft.meta.storageKey));
    }

    setPendingDraft(null);
  }

  function handleDiscardDraft() {
    clearAdminFormDraft(draftKey);
    setPendingDraft(null);
    setForm(initialData ?? emptyProjectForm());
    setSlugTouched(Boolean(initialData?.slug));
    setStorageKey(projectId ?? crypto.randomUUID());
  }

  function updateField<K extends keyof ProjectFormInput>(
    key: K,
    value: ProjectFormInput[K],
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "title" && !slugTouched) {
        next.slug = ensureUniqueProjectSlug(
          String(value),
          existingSlugs,
          originalSlug,
        );
      }

      return next;
    });
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (!files.length || uploading) {
      return;
    }

    setUploading(true);
    const uploaded: ProjectImageDraft[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storageKey", projectId ?? storageKey);

      const result = await uploadProjectImage(formData);

      if (!result.success) {
        toast.error(result.error);
        continue;
      }

      uploaded.push(result.image);
    }

    setUploading(false);

    if (!uploaded.length) {
      return;
    }

    setForm((current) => {
      const images = [...current.images, ...uploaded];

      return {
        ...current,
        images,
        featuredImageUrl: current.featuredImageUrl || uploaded[0].url,
      };
    });

    if (uploaded.length > 1) {
      toast.success(`${uploaded.length} photos added.`);
    }
  }

  async function handleRemoveImage(image: ProjectImageDraft) {
    if (image.storagePath) {
      const result = await deleteProjectImage(image.storagePath);

      if (!result.success) {
        toast.error(result.error);
        return;
      }
    }

    setForm((current) => {
      const images = current.images.filter((item) => item.id !== image.id);
      const featuredImageUrl =
        current.featuredImageUrl === image.url
          ? images[0]?.url ?? ""
          : current.featuredImageUrl;

      return {
        ...current,
        images,
        featuredImageUrl,
      };
    });
  }

  function handleSubmit() {
    startTransition(async () => {
      let result: ProjectActionResult;

      if (isEditing && projectId) {
        result = await updateProject(projectId, form);
      } else {
        result = await createProject(form);
      }

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      clearAdminFormDraft(draftKey);
      toast.success(isEditing ? "Project updated." : "Project created.");
      onSaved?.();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-[560px] flex-col border-x border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3 sm:px-8">
          <div>
            <div className="text-xs text-muted">
              {isEditing ? "Edit project" : "New project"}
            </div>
            <h2 className="font-primary text-lg font-medium">
              {isEditing ? form.title || "Project" : "Add project"}
            </h2>
          </div>
          <button
            aria-label="Close project form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            disabled={isPending}
            onClick={handleClose}
            type="button"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-8">
          {pendingDraft ? (
            <AdminFormDraftPrompt
              onDiscard={handleDiscardDraft}
              onRestore={handleRestoreDraft}
              savedAt={pendingDraft.savedAt}
            />
          ) : (
            <>
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="POP ceiling with cove lighting"
              value={form.title}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Slug</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
              onChange={(event) => {
                setSlugTouched(true);
                updateField("slug", event.target.value);
              }}
              value={form.slug}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Area / society / locality</span>
            <span className="mt-1 block text-xs text-muted">
              Society or area name only — not full address.
            </span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="DHA Phase 6"
              value={form.location}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Service type</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
              list="project-service-suggestions"
              onChange={(event) => updateField("serviceType", event.target.value)}
              placeholder="POP false ceiling"
              value={form.serviceType}
            />
            <datalist id="project-service-suggestions">
              {PROJECT_SERVICE_SUGGESTIONS.map((service) => (
                <option key={service} value={service} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Short description</span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm outline-none transition focus:border-border-strong"
              onChange={(event) =>
                updateField("shortDescription", event.target.value)
              }
              placeholder="Shown on cards — keep it brief."
              value={form.shortDescription}
            />
          </label>

          <div className="block">
            <span className="text-sm font-medium">Full description (optional)</span>
            <button
              className="mt-2 w-full rounded-xl border border-border-soft bg-surface-raised/60 p-4 text-left transition hover:border-border-strong hover:bg-surface-muted/60"
              onClick={() => setEditorOpen(true)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {hasDescription ? "Edit full description" : "Write full description"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {hasDescription
                      ? descriptionPreview
                      : "Open the article editor for scope, materials, timeline, and more."}
                  </p>
                </div>
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted">
                  <Pencil size={15} />
                </span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Status</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
                onChange={(event) =>
                  updateField("status", event.target.value as ProjectFormInput["status"])
                }
                value={form.status}
              >
                {PROJECT_STATUSES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Completed date</span>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
                onChange={(event) => updateField("completedAt", event.target.value)}
                type="date"
                value={form.completedAt}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Photos</span>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border-strong px-3 text-xs font-medium disabled:opacity-70"
                disabled={uploading || isPending}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <ImageUp size={14} />
                )}
                Add photo
              </button>
            </div>

            <input
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              multiple
              onChange={handleImageUpload}
              ref={fileInputRef}
              type="file"
            />

            {form.images.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {form.images.map((image) => {
                  const isFeatured = form.featuredImageUrl === image.url;

                  return (
                    <div
                      className="relative aspect-square overflow-hidden rounded-xl border border-border-soft bg-surface-muted"
                      key={image.id}
                    >
                      <Image
                        alt="Project photo"
                        className="object-cover"
                        fill
                        sizes="120px"
                        src={image.url}
                        unoptimized={image.url.startsWith("http")}
                      />

                      <div className="absolute inset-x-0 top-0 flex justify-between gap-1 p-1">
                        <button
                          aria-label={
                            isFeatured ? "Featured photo" : "Set as featured photo"
                          }
                          className={`inline-flex size-7 items-center justify-center rounded-full border backdrop-blur-sm ${
                            isFeatured
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border-soft bg-surface/90 text-muted"
                          }`}
                          onClick={() => updateField("featuredImageUrl", image.url)}
                          type="button"
                        >
                          <Star size={13} />
                        </button>

                        <button
                          aria-label="Remove photo"
                          className="inline-flex size-7 items-center justify-center rounded-full border border-border-soft bg-surface/90 text-muted backdrop-blur-sm"
                          onClick={() => handleRemoveImage(image)}
                          type="button"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Add at least one photo for the public gallery.
              </p>
            )}
          </div>

          <label className="block">
            <span className="text-sm font-medium">Sort order</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
              inputMode="numeric"
              onChange={(event) => updateField("sortOrder", event.target.value)}
              value={form.sortOrder}
            />
          </label>

          <div className="space-y-3 rounded-xl border border-border-soft bg-surface-muted/60 p-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Show on homepage</span>
              <input
                checked={form.showOnHomepage}
                className="size-4 accent-primary"
                onChange={(event) =>
                  updateField("showOnHomepage", event.target.checked)
                }
                type="checkbox"
              />
            </label>

            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Published</span>
              <input
                checked={form.published}
                className="size-4 accent-primary"
                onChange={(event) => updateField("published", event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>
            </>
          )}
        </div>

        <footer className="border-t border-border-soft px-4 py-3 sm:px-8">
          <div className="flex gap-2">
            <button
              className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium"
              disabled={isPending}
              onClick={handleClose}
              type="button"
            >
              Cancel
            </button>
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
                "Save project"
              ) : (
                "Create project"
              )}
            </button>
          </div>
        </footer>
      </div>

      <ServiceContentEditorModal
        initialContent={form.description}
        onClose={() => setEditorOpen(false)}
        onSave={(content) => updateField("description", content)}
        open={editorOpen}
        title={form.title}
      />
    </div>
  );
}