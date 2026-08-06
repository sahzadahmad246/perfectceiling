"use client";

import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  ImageUp,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createCatalogueImages,
  updateCatalogueImage,
  uploadCatalogueImage,
} from "@/app/admin/catalogue/actions";
import {
  catalogueItemToDraft,
  draftToFormInput,
  emptyCatalogueDraft,
  type CatalogueFormInput,
  type CatalogueImageDraft,
  type CatalogueImageItem,
} from "@/lib/catalogue";
import {
  getImageMimeType,
  MAX_UPLOAD_IMAGE_SIZE,
} from "@/lib/upload-image";
import { cn } from "@/lib/utils";

type CatalogueFormModalProps = {
  open: boolean;
  onClose: () => void;
  imageId?: string;
  /** Edit mode: existing item. Create mode: omit. */
  initialItem?: CatalogueImageItem | null;
  onSaved?: () => void;
};

function isBlobUrl(url: string) {
  return url.startsWith("blob:");
}

function revokePreviewUrl(url: string) {
  if (isBlobUrl(url)) {
    URL.revokeObjectURL(url);
  }
}

function validateLocalImage(file: File): string | null {
  if (!getImageMimeType(file)) {
    return "Use PNG, JPG, or WEBP.";
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}

export function CatalogueFormModal({
  open,
  onClose,
  imageId,
  initialItem,
  onSaved,
}: CatalogueFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <CatalogueFormModalInner
      imageId={imageId}
      initialItem={initialItem}
      key={imageId ?? "create"}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function CatalogueFormModalInner({
  onClose,
  imageId,
  initialItem,
  onSaved,
}: Omit<CatalogueFormModalProps, "open">) {
  const isEditing = Boolean(imageId && initialItem);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const draftsRef = useRef<CatalogueImageDraft[]>([]);
  const [drafts, setDrafts] = useState<CatalogueImageDraft[]>(() =>
    initialItem ? [catalogueItemToDraft(initialItem)] : [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialItem ? initialItem.id : null,
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selected =
    drafts.find((draft) => draft.clientId === selectedId) ?? drafts[0] ?? null;

  function updateThumbScrollState() {
    const el = thumbScrollRef.current;

    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
  }

  function scrollThumbs(direction: "left" | "right") {
    const el = thumbScrollRef.current;

    if (!el) {
      return;
    }

    const amount = Math.max(el.clientWidth * 0.7, 120);
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";

      for (const draft of draftsRef.current) {
        revokePreviewUrl(draft.imageUrl);
      }
    };
  }, []);

  useEffect(() => {
    updateThumbScrollState();

    const el = thumbScrollRef.current;

    if (!el) {
      return;
    }

    const onScroll = () => updateThumbScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateThumbScrollState())
        : null;
    observer?.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, [drafts.length]);

  function openFilePicker() {
    if (isPending) {
      return;
    }

    fileInputRef.current?.click();
  }

  function updateSelectedField<K extends keyof CatalogueImageDraft>(
    key: K,
    value: CatalogueImageDraft[K],
  ) {
    if (!selected) {
      return;
    }

    const id = selected.clientId;

    setDrafts((current) =>
      current.map((draft) =>
        draft.clientId === id ? { ...draft, [key]: value } : draft,
      ),
    );
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length || isPending) {
      return;
    }

    const accepted: CatalogueImageDraft[] = [];

    for (const file of files) {
      const error = validateLocalImage(file);

      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      const nextOrder = String(drafts.length + accepted.length);
      const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const previewUrl = URL.createObjectURL(file);

      accepted.push({
        ...emptyCatalogueDraft(nextOrder),
        imageUrl: previewUrl,
        storagePath: "",
        file,
        caption: baseName.trim() || "",
        sortOrder: isEditing ? (selected?.sortOrder ?? "0") : nextOrder,
      });

      if (isEditing) {
        break;
      }
    }

    if (!accepted.length) {
      return;
    }

    if (isEditing && selected) {
      revokePreviewUrl(selected.imageUrl);
      const next = accepted[0];
      setDrafts([
        {
          ...selected,
          imageUrl: next.imageUrl,
          storagePath: "",
          file: next.file,
        },
      ]);
      return;
    }

    setDrafts((current) => [...current, ...accepted]);
    setSelectedId(accepted[accepted.length - 1].clientId);
  }

  function removeDraft(clientId: string) {
    setDrafts((current) => {
      const removed = current.find((draft) => draft.clientId === clientId);

      if (removed) {
        revokePreviewUrl(removed.imageUrl);
      }

      const next = current.filter((draft) => draft.clientId !== clientId);

      if (selectedId === clientId) {
        setSelectedId(next[0]?.clientId ?? null);
      }

      return next;
    });
  }

  async function resolveDraftForSave(
    draft: CatalogueImageDraft,
  ): Promise<{ error: string } | { input: CatalogueFormInput }> {
    if (!draft.caption.trim()) {
      return { error: "Caption is required." };
    }

    if (draft.file) {
      const formData = new FormData();
      formData.append("file", draft.file);

      const upload = await uploadCatalogueImage(formData);

      if (!upload.success) {
        return { error: upload.error };
      }

      return {
        input: draftToFormInput({
          ...draft,
          imageUrl: upload.image.url,
          storagePath: upload.image.storagePath,
        }),
      };
    }

    if (!draft.imageUrl.trim()) {
      return { error: "Please add an image." };
    }

    return { input: draftToFormInput(draft) };
  }

  function handleSubmit() {
    if (!drafts.length) {
      toast.error("Add at least one image.");
      return;
    }

    startTransition(async () => {
      if (isEditing && imageId && drafts[0]) {
        const resolved = await resolveDraftForSave(drafts[0]);

        if ("error" in resolved) {
          toast.error(resolved.error);
          return;
        }

        const result = await updateCatalogueImage(imageId, resolved.input);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("Image updated.");
        onSaved?.();
        onClose();
        return;
      }

      const inputs: CatalogueFormInput[] = [];

      for (let index = 0; index < drafts.length; index += 1) {
        const resolved = await resolveDraftForSave(drafts[index]);

        if ("error" in resolved) {
          toast.error(`Image ${index + 1}: ${resolved.error}`);
          return;
        }

        inputs.push(resolved.input);
      }

      const result = await createCatalogueImages(inputs);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        result.ids.length === 1
          ? "Image added."
          : `${result.ids.length} images added.`,
      );
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
              {isEditing ? "Edit image" : "New images"}
            </div>
            <h2 className="font-primary text-lg font-medium">
              {isEditing ? "Update catalogue image" : "Add catalogue images"}
            </h2>
          </div>
          <button
            aria-label="Close form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-8">
          <input
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={isPending}
            multiple={!isEditing}
            onChange={handleFilesSelected}
            ref={fileInputRef}
            type="file"
          />

          <button
            className="relative block w-full overflow-hidden rounded-2xl border border-border-soft bg-surface-muted text-left transition hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70"
            disabled={isPending}
            onClick={openFilePicker}
            type="button"
          >
            {selected?.imageUrl ? (
              <div className="relative aspect-[4/3]">
                <Image
                  alt={selected.altText || selected.caption || "Catalogue image"}
                  className="object-cover"
                  fill
                  sizes="560px"
                  src={selected.imageUrl}
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3">
                  <p className="line-clamp-2 text-sm font-medium text-white">
                    {selected.caption || "Caption preview"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 text-muted">
                <ImageUp size={28} strokeWidth={1.75} />
                <p className="text-sm font-medium text-foreground">
                  Tap to add photos
                </p>
                <p className="text-xs">
                  {isEditing ? "PNG, JPG, or WEBP" : "Select one or more"}
                </p>
              </div>
            )}
          </button>

          {drafts.length > 0 ? (
            <div className="relative pt-2.5">
              {canScrollLeft ? (
                <button
                  aria-label="Scroll images left"
                  className="absolute left-0 top-1/2 z-30 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-surface-raised text-foreground shadow-md transition hover:border-primary"
                  onClick={() => scrollThumbs("left")}
                  type="button"
                >
                  <ChevronLeft size={18} strokeWidth={2.25} />
                </button>
              ) : null}

              {canScrollRight ? (
                <button
                  aria-label="Scroll images right"
                  className="absolute right-0 top-1/2 z-30 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-surface-raised text-foreground shadow-md transition hover:border-primary"
                  onClick={() => scrollThumbs("right")}
                  type="button"
                >
                  <ChevronRight size={18} strokeWidth={2.25} />
                </button>
              ) : null}

              <div
                className={cn(
                  "flex items-center gap-2 overflow-x-auto px-0.5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  canScrollLeft && "pl-10",
                  canScrollRight && "pr-10",
                )}
                onScroll={updateThumbScrollState}
                ref={thumbScrollRef}
              >
                {drafts.map((draft) => {
                  const isActive = draft.clientId === selected?.clientId;

                  return (
                    <div className="relative shrink-0" key={draft.clientId}>
                      <button
                        className={cn(
                          "relative size-16 overflow-hidden rounded-xl border-2 bg-surface-muted transition",
                          isActive
                            ? "border-primary"
                            : "border-transparent opacity-80 hover:opacity-100",
                        )}
                        onClick={() => setSelectedId(draft.clientId)}
                        type="button"
                      >
                        {draft.imageUrl ? (
                          <Image
                            alt=""
                            className="object-cover"
                            fill
                            sizes="64px"
                            src={draft.imageUrl}
                            unoptimized
                          />
                        ) : null}
                      </button>
                      {!isEditing || drafts.length > 1 ? (
                        <button
                          aria-label="Remove image"
                          className="absolute -right-1.5 -top-1.5 z-20 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-surface"
                          disabled={isPending}
                          onClick={() => removeDraft(draft.clientId)}
                          type="button"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      ) : null}
                    </div>
                  );
                })}

                {!isEditing ? (
                  <button
                    aria-label="Add more images"
                    className="flex size-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-border-strong text-muted transition hover:border-primary hover:text-foreground"
                    disabled={isPending}
                    onClick={openFilePicker}
                    type="button"
                  >
                    <ImagePlus size={18} />
                    <span className="text-[10px] font-medium">Add</span>
                  </button>
                ) : (
                  <button
                    aria-label="Replace image"
                    className="flex size-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-border-strong text-muted transition hover:border-primary hover:text-foreground"
                    disabled={isPending}
                    onClick={openFilePicker}
                    type="button"
                  >
                    <ImagePlus size={18} />
                    <span className="text-[10px] font-medium">Replace</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {selected ? (
            <>
              <label className="block">
                <span className="text-sm font-medium">Caption</span>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
                  onChange={(event) =>
                    updateSelectedField("caption", event.target.value)
                  }
                  placeholder="Cove lighting POP ceiling"
                  value={selected.caption}
                />
                <span className="mt-1 block text-xs text-muted">
                  Short label on the photo (e.g. design style or room).
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Alt text</span>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
                  onChange={(event) =>
                    updateSelectedField("altText", event.target.value)
                  }
                  placeholder={selected.caption || "Describe the photo"}
                  value={selected.altText}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">SEO description</span>
                <textarea
                  className="mt-2 min-h-20 w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm outline-none transition focus:border-border-strong"
                  onChange={(event) =>
                    updateSelectedField("seoDescription", event.target.value)
                  }
                  placeholder="Optional — longer text for search engines"
                  value={selected.seoDescription}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium">Display order</span>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
                    inputMode="numeric"
                    onChange={(event) =>
                      updateSelectedField("sortOrder", event.target.value)
                    }
                    value={selected.sortOrder}
                  />
                  <span className="mt-1 block text-xs text-muted">
                    Lower numbers show first on the homepage.
                  </span>
                </label>

                <div className="flex flex-col">
                  <span className="text-sm font-medium">Published</span>
                  <button
                    className={cn(
                      "mt-2 h-11 rounded-xl border text-sm font-medium transition",
                      selected.published
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-border-soft bg-surface text-muted",
                    )}
                    onClick={() =>
                      updateSelectedField("published", !selected.published)
                    }
                    type="button"
                  >
                    {selected.published ? "Live on homepage" : "Hidden (draft)"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">
              Tap the preview area to choose design photos.
            </p>
          )}
        </div>

        <footer className="border-t border-border-soft px-4 py-3 sm:px-8">
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-70"
            disabled={isPending || !drafts.length}
            onClick={handleSubmit}
            type="button"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving…
              </>
            ) : isEditing ? (
              "Save changes"
            ) : drafts.length > 1 ? (
              `Add ${drafts.length} images`
            ) : (
              "Add to catalogue"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
