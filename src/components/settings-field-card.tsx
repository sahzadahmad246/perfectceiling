"use client";

import { Download, ImageUp, Loader2, Pencil, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  updateBusinessSetting,
  uploadBusinessLogo,
  type SettingsActionResult,
} from "@/app/admin/settings/actions";

type SettingsFieldCardProps = {
  field: string;
  label: string;
  value: string | null;
  multiline?: boolean;
};

function parseTerms(value: string | null) {
  return (
    value
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? []
  );
}

function serializeTerms(lines: string[]) {
  return lines.join("\n");
}

function getTermsPreview(value: string | null) {
  const lines = parseTerms(value);

  if (lines.length === 0) {
    return "Not added";
  }

  const preview = lines[0].slice(0, 42);

  return `${preview}...`;
}

const settingsModalOverlayClass =
  "fixed inset-0 z-[9990] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

const termsTextareaClass =
  "mt-4 h-16 resize-none w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

const logoViewerActionClass =
  "flex size-10 items-center justify-center rounded-full border border-border-strong bg-surface-raised text-foreground shadow-sm transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-70";

function getLogoFileName(url: string) {
  try {
    const segment = new URL(url).pathname.split("/").pop();

    if (segment?.includes(".")) {
      return segment;
    }
  } catch {
    // Fall back to a default filename below.
  }

  return "business-logo.png";
}

function ModalSubmitButton({
  isPending,
  label,
}: {
  isPending: boolean;
  label: string;
}) {
  return (
    <button
      aria-busy={isPending}
      aria-label={isPending ? "Saving" : label}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isPending}
      type="submit"
    >
      {isPending ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        label
      )}
    </button>
  );
}

export function SettingsFieldCard({
  field,
  label,
  value,
  multiline = false,
}: SettingsFieldCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    SettingsActionResult | null,
    FormData
  >(updateBusinessSetting, null);
  const inputId = `setting-${field}`;
  const displayValue = value?.trim() || "Not added";

  useEffect(() => {
    if (!state) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (state.success) {
        toast.success(`${label} updated.`);
        setOpen(false);
        router.refresh();
        return;
      }

      toast.error(state.error);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [label, router, state]);

  return (
    <article className="flex items-start justify-between gap-4 border-b border-border-soft py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
          {displayValue}
        </p>
      </div>
      <button
        aria-label={`Edit ${label}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition hover:border-primary hover:text-foreground"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Pencil size={15} />
      </button>

      {open ? (
        <div className={settingsModalOverlayClass}>
          <button
            aria-label="Close edit modal"
            className="absolute inset-0"
            disabled={isPending}
            onClick={() => setOpen(false)}
            type="button"
          />
          <form
            action={formAction}
            className="relative z-10 w-full max-w-md rounded-lg border border-border-soft bg-surface-raised p-5 shadow-popover"
          >
            <input name="field" type="hidden" value={field} />
            <label className="text-sm font-medium" htmlFor={inputId}>
              {label}
            </label>
            {multiline ? (
              <textarea
                className="mt-3 min-h-32 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm outline-none transition focus:border-primary"
                defaultValue={value ?? ""}
                disabled={isPending}
                id={inputId}
                name="value"
              />
            ) : (
              <input
                className="mt-3 h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary"
                defaultValue={value ?? ""}
                disabled={isPending}
                id={inputId}
                name="value"
              />
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="h-10 rounded-full border border-border-strong px-5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
                onClick={() => setOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <ModalSubmitButton isPending={isPending} label="Save" />
            </div>
          </form>
        </div>
      ) : null}
    </article>
  );
}

type TermsFieldCardProps = {
  field: string;
  label: string;
  value: string | null;
};

export function TermsFieldCard({ field, label, value }: TermsFieldCardProps) {
  const router = useRouter();
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [termDraft, setTermDraft] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [state, formAction, isPending] = useActionState<
    SettingsActionResult | null,
    FormData
  >(updateBusinessSetting, null);
  const terms = parseTerms(value);
  const preview = getTermsPreview(value);

  useEffect(() => {
    if (!state) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (state.success) {
        toast.success(`${label} updated.`);
        setEditOpen(false);
        router.refresh();
        return;
      }

      toast.error(state.error);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [label, router, state]);

  function openEditModal() {
    setLines(parseTerms(value));
    setTermDraft("");
    setEditOpen(true);
  }

  function addLine() {
    const nextTerm = termDraft.trim();

    if (!nextTerm) {
      return;
    }

    setLines((currentLines) => [...currentLines, nextTerm]);
    setTermDraft("");
  }

  function removeLine(index: number) {
    setLines((currentLines) =>
      currentLines.filter((_, lineIndex) => lineIndex !== index),
    );
  }

  return (
    <article className="flex items-start justify-between gap-4 border-b border-border-soft py-4 last:border-b-0">
      <button
        className="min-w-0 flex-1 text-left"
        onClick={() => setViewOpen(true)}
        type="button"
      >
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 truncate text-sm leading-6 text-foreground">
          {preview}
        </p>
      </button>
      <button
        aria-label={`Edit ${label}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition hover:border-primary hover:text-foreground"
        onClick={openEditModal}
        type="button"
      >
        <Pencil size={15} />
      </button>

      {viewOpen ? (
        <div className={settingsModalOverlayClass}>
          <button
            aria-label="Close terms view modal"
            className="absolute inset-0"
            onClick={() => setViewOpen(false)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-border-soft bg-surface-raised p-5 shadow-popover">
            <p className="text-sm font-medium">{label}</p>
            {terms.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {terms.map((term, index) => (
                  <li
                    className="flex gap-3 text-sm leading-6 text-foreground"
                    key={`${term}-${index}`}
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="whitespace-pre-wrap">{term}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">No terms added yet.</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="h-10 rounded-full border border-border-strong px-5 text-sm font-medium"
                onClick={() => setViewOpen(false)}
                type="button"
              >
                Close
              </button>
              <button
                className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
                onClick={() => {
                  setViewOpen(false);
                  openEditModal();
                }}
                type="button"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div className={settingsModalOverlayClass}>
          <button
            aria-label="Close terms edit modal"
            className="absolute inset-0"
            disabled={isPending}
            onClick={() => setEditOpen(false)}
            type="button"
          />
          <form
            action={formAction}
            className="relative z-10 w-full max-w-md rounded-lg border border-border-soft bg-surface-raised p-5 shadow-popover"
          >
            <input name="field" type="hidden" value={field} />
            <input
              name="value"
              type="hidden"
              value={serializeTerms(lines)}
            />
            <p className="text-sm font-medium">{label}</p>
            <textarea
              className={termsTextareaClass}
              disabled={isPending}
              onChange={(event) => setTermDraft(event.target.value)}
              placeholder="Write a term, then click Add"
              rows={2}
              value={termDraft}
            />
            <div className="mt-3 flex justify-end">
              <button
                className="inline-flex h-10 items-center gap-1 rounded-full border border-border-strong px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending || !termDraft.trim()}
                onClick={addLine}
                type="button"
              >
                <Plus size={15} />
                Add
              </button>
            </div>
            {lines.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {lines.map((term, index) => (
                  <li
                    className="flex items-start gap-2 rounded-md border border-border-soft bg-surface px-3 py-2"
                    key={`${term}-${index}`}
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {term}
                    </span>
                    <button
                      aria-label={`Remove term ${index + 1}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isPending}
                      onClick={() => removeLine(index)}
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Added terms will appear here.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="h-10 rounded-full border border-border-strong px-5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
                onClick={() => setEditOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <ModalSubmitButton isPending={isPending} label="Save" />
            </div>
          </form>
        </div>
      ) : null}
    </article>
  );
}

export function LogoFieldCard({ logoUrl }: { logoUrl: string | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isDownloadingLogo, setIsDownloadingLogo] = useState(false);
  const [hideExistingLogo, setHideExistingLogo] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<
    SettingsActionResult | null,
    FormData
  >(uploadBusinessLogo, null);
  const displayImageUrl =
    previewUrl ?? (hideExistingLogo ? null : logoUrl);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!viewerOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [viewerOpen]);

  const resetSelection = useCallback(() => {
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return null;
    });
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  function openModal() {
    setHideExistingLogo(false);
    setOpen(true);
  }

  function closeModal() {
    if (isPending) {
      return;
    }

    resetSelection();
    setHideExistingLogo(false);
    setOpen(false);
  }

  function clearLogoPreview() {
    if (selectedFile) {
      resetSelection();
      return;
    }

    setHideExistingLogo(true);
  }

  useEffect(() => {
    if (!state) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (state.success) {
        toast.success("Logo uploaded.");
        resetSelection();
        setHideExistingLogo(false);
        setOpen(false);
        router.refresh();
        return;
      }

      toast.error(state.error);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [resetSelection, router, state]);

  async function downloadLogo() {
    if (!logoUrl || isDownloadingLogo) {
      return;
    }

    setIsDownloadingLogo(true);

    const fileName = getLogoFileName(logoUrl);

    try {
      const response = await fetch(logoUrl);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.href = logoUrl;
      link.download = fileName;
      link.rel = "noopener noreferrer";
      link.target = "_blank";
      link.click();
    } finally {
      setIsDownloadingLogo(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      resetSelection();
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <article className="flex items-center justify-between gap-4 border-b border-border-soft py-4">
      <div className="flex min-w-0 items-center gap-4">
        {logoUrl ? (
          <button
            aria-label="View logo fullscreen"
            className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-strong bg-surface transition hover:border-primary"
            onClick={() => setViewerOpen(true)}
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Business logo"
              className="size-full object-cover"
              src={logoUrl}
            />
          </button>
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-border-strong bg-surface">
            <ImageUp className="text-muted" size={20} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm text-muted">Logo</p>
          <p className="mt-1 truncate text-sm text-foreground">
            {logoUrl ? "Uploaded" : "Not added"}
          </p>
        </div>
      </div>
      <button
        aria-label="Edit logo"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition hover:border-primary hover:text-foreground"
        onClick={openModal}
        type="button"
      >
        <Pencil size={15} />
      </button>

      {viewerOpen && logoUrl ? (
        <div className="fixed inset-0 z-[9995] h-dvh w-full overflow-hidden bg-primary/92 backdrop-blur-md">
          <button
            aria-label="Close logo preview"
            className="absolute inset-0"
            onClick={() => setViewerOpen(false)}
            type="button"
          />
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
            <button
              aria-busy={isDownloadingLogo}
              aria-label={isDownloadingLogo ? "Downloading logo" : "Download logo"}
              className={logoViewerActionClass}
              disabled={isDownloadingLogo}
              onClick={downloadLogo}
              type="button"
            >
              {isDownloadingLogo ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Download size={18} />
              )}
            </button>
            <button
              aria-label="Dismiss logo preview"
              className={logoViewerActionClass}
              disabled={isDownloadingLogo}
              onClick={() => setViewerOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex h-full w-full items-center justify-center p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Business logo fullscreen preview"
              className="relative z-10 max-h-full max-w-full object-contain"
              src={logoUrl}
            />
          </div>
        </div>
      ) : null}

      {open ? (
        <div className={settingsModalOverlayClass}>
          <button
            aria-label="Close logo modal"
            className="absolute inset-0"
            disabled={isPending}
            onClick={closeModal}
            type="button"
          />
          <form
            action={formAction}
            className="relative z-10 w-full max-w-sm rounded-lg border border-border-soft bg-surface-raised p-5 shadow-popover"
          >
            <p className="text-sm font-medium">Upload logo</p>
            <p className="mt-1 text-xs text-muted">
              Tap the square to choose an image.
            </p>

            <input
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
              className="sr-only"
              id="business-logo"
              name="logo"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />

            <div className="mt-5 flex justify-center">
              <div className="relative size-36">
                {displayImageUrl ? (
                  <>
                    <div className="size-full overflow-hidden rounded-xl border border-border-strong bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={
                          selectedFile
                            ? "Selected logo preview"
                            : "Current business logo"
                        }
                        className="size-full object-cover"
                        src={displayImageUrl}
                      />
                    </div>
                    <button
                      aria-label={
                        selectedFile
                          ? "Remove selected logo"
                          : "Clear current logo preview"
                      }
                      className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border border-border-strong bg-surface-raised text-muted shadow-sm transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isPending}
                      onClick={clearLogoPreview}
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    className="flex size-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface text-muted transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isPending}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <ImageUp size={24} />
                    <span className="text-xs">Select image</span>
                  </button>
                )}
              </div>
            </div>

            {selectedFile ? (
              <p className="mt-4 text-center text-xs text-muted">
                {selectedFile.name} · {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            ) : null}

            <p className="mt-4 text-center text-xs leading-5 text-muted">
              PNG, JPG, WEBP, or SVG. Max 5MB.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="h-10 rounded-full border border-border-strong px-5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending}
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              <button
                aria-busy={isPending}
                aria-label={isPending ? "Uploading logo" : "Upload logo"}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isPending || !selectedFile}
                type="submit"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </article>
  );
}