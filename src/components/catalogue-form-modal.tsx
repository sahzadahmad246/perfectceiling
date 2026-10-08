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
  createCatalogueGroup,
  updateCatalogueGroup,
  uploadCatalogueImage,
} from "@/app/admin/catalogue/actions";
import {
  emptyCatalogueImageDraft,
  groupItemToImageDrafts,
  type CatalogueFormInput,
  type CatalogueGroupItem,
  type CatalogueImageDraft,
} from "@/lib/catalogue";
import {
  getImageMimeType,
  MAX_UPLOAD_IMAGE_SIZE,
} from "@/lib/upload-image";
import { cn } from "@/lib/utils";

type CatalogueFormModalProps = {
  open: boolean;
  onClose: () => void;
  groupId?: string;
  /** Edit mode: existing group. Create mode: omit. */
  initialItem?: CatalogueGroupItem | null;
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
  groupId,
  initialItem,
  onSaved,
}: CatalogueFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <CatalogueFormModalInner
      groupId={groupId}
      initialItem={initialItem}
      key={groupId ?? "create"}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function CatalogueFormModalInner({
  onClose,
  groupId,
  initialItem,
  onSaved,
}: Omit<CatalogueFormModalProps, "open">) {
  const isEditing = Boolean(groupId && initialItem);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const draftsRef = useRef<CatalogueImageDraft[]>([]);
  const [title, setTitle] = useState(() => initialItem?.title ?? "");
  const [description, setDescription] = useState(
    () => initialItem?.description ?? "",
  );
  const [published, setPublished] = useState(
    () => initialItem?.published ?? true,
  );
  const [sortOrder, setSortOrder] = useState(() =>
    String(initialItem?.sortOrder ?? 0),
  );
  const [imageDrafts, setImageDrafts] = useState<CatalogueImageDraft[]>(() =>
    initialItem ? groupItemToImageDrafts(initialItem) : [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialItem?.images[0]?.id ?? null,
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selected =
    imageDrafts.find((draft) => draft.clientId === selectedId) ??
    imageDrafts[0] ??
    null;

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
    draftsRef.current = imageDrafts;
  }, [imageDrafts]);

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
  }, [imageDrafts.length]);

  function openFilePicker() {
    if (isPending) {
      return;
    }

    fileInputRef.current?.click();
  }

  function updateSelectedImageField<K extends keyof CatalogueImageDraft>(
    key: K,
    value: CatalogueImageDraft[K],
  ) {
    if (!selected) {
      return;
    }

    const id = selected.clientId;

    setImageDrafts((current) =>
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
    const makeFirstThumbnail =
      imageDrafts.length === 0 ||
      !imageDrafts.some((draft) => draft.isThumbnail);

    for (const file of files) {
      const error = validateLocalImage(file);

      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      const nextOrder = String(imageDrafts.length + accepted.length);
      const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const previewUrl = URL.createObjectURL(file);

      accepted.push({
        ...emptyCatalogueImageDraft(nextOrder),
        imageUrl: previewUrl,
        storagePath: "",
        file,
        subtitle: baseName.trim() || "",
        isThumbnail: makeFirstThumbnail && accepted.length === 0,
      });
    }

    if (!accepted.length) {
      return;
    }

    setImageDrafts((current) => [...current, ...accepted]);
    setSelectedId(accepted[accepted.length - 1].clientId);
  }

  function removeImageDraft(clientId: string) {
    setImageDrafts((current) => {
      const removed = current.find((draft) => draft.clientId === clientId);

      if (removed) {
        revokePreviewUrl(removed.imageUrl);
      }

      let next = current.filter((draft) => draft.clientId !== clientId);

      if (removed?.isThumbnail && next.length > 0) {
        next = next.map((draft, index) => ({
          ...draft,
          isThumbnail: index === 0,
        }));
      }

      if (selectedId === clientId) {
        setSelectedId(next[0]?.clientId ?? null);
      }

      return next;
    });
  }

  function setSelectedAsThumbnail() {
    if (!selected) {
      return;
    }

    const id = selected.clientId;

    setImageDrafts((current) =>
      current.map((draft) => ({
        ...draft,
        isThumbnail: draft.clientId === id,
      })),
    );
  }

  async function resolveImageDraft(
    draft: CatalogueImageDraft,
  ): Promise<
    | { error: string }
    | { image: CatalogueFormInput["images"][number] }
  > {
    if (draft.file) {
      const formData = new FormData();
      formData.append("file", draft.file);
      formData.append("title", title);
      formData.append("subtitle", draft.subtitle);

      const upload = await uploadCatalogueImage(formData);

      if (!upload.success) {
        return { error: upload.error };
      }

      return {
        image: {
          id: draft.id,
          imageUrl: upload.image.url,
          width: upload.image.width,
          height: upload.image.height,
          storagePath: upload.image.storagePath,
          subtitle: draft.subtitle,
          isThumbnail: draft.isThumbnail,
          sortOrder: draft.sortOrder,
        },
      };
    }

    if (!draft.imageUrl.trim()) {
      return { error: "Please add an image." };
    }

    return {
      image: {
        id: draft.id,
        imageUrl: draft.imageUrl,
        width: draft.width,
        height: draft.height,
        storagePath: draft.storagePath,
        subtitle: draft.subtitle,
        isThumbnail: draft.isThumbnail,
        sortOrder: draft.sortOrder,
      },
    };
  }

  function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (!imageDrafts.length) {
      toast.error("Add at least one image.");
      return;
    }

    startTransition(async () => {
      const images: CatalogueFormInput["images"] = [];

      for (let index = 0; index < imageDrafts.length; index += 1) {
        const resolved = await resolveImageDraft(imageDrafts[index]);

        if ("error" in resolved) {
          toast.error(`Image ${index + 1}: ${resolved.error}`);
          return;
        }

        images.push({
          ...resolved.image,
          sortOrder: String(index),
        });
      }

      const input: CatalogueFormInput = {
        title,
        description,
        published,
        sortOrder,
        images,
      };

      const result =
        isEditing && groupId
          ? await updateCatalogueGroup(groupId, input)
          : await createCatalogueGroup(input);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Group updated." : "Catalogue group added.");
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
              {isEditing ? "Edit group" : "New group"}
            </div>
            <h2 className="font-primary text-lg font-medium">
              {isEditing ? "Update catalogue group" : "Add catalogue group"}
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
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Moldings"
              value={title}
            />
            <span className="mt-1 block text-xs text-muted">
              Group name shown on the catalogue (e.g. False ceiling, Moldings).
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Description{" "}
              <span className="font-normal text-muted">(optional)</span>
            </span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm outline-none transition focus:border-border-strong"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short note about this design collection"
              value={description}
            />
          </label>

          <input
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={isPending}
            multiple
            onChange={handleFilesSelected}
            ref={fileInputRef}
            type="file"
          />

          <div>
            <span className="text-sm font-medium">Photos</span>
            <button
              className="relative mt-2 block w-full overflow-hidden rounded-2xl border border-border-soft bg-surface-muted text-left transition hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70"
              disabled={isPending}
              onClick={openFilePicker}
              type="button"
            >
              {selected?.imageUrl ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    alt={
                      selected.subtitle ||
                      title ||
                      "Catalogue image"
                    }
                    className="object-cover"
                    fill
                    loading="eager"
                    priority
                    sizes="560px"
                    src={selected.imageUrl}
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3">
                    <p className="line-clamp-2 text-sm font-medium text-white">
                      {selected.subtitle || "Subtitle preview"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 text-muted">
                  <ImageUp size={28} strokeWidth={1.75} />
                  <p className="text-sm font-medium text-foreground">
                    Tap to add photos
                  </p>
                  <p className="text-xs">Select one or more PNG, JPG, or WEBP</p>
                </div>
              )}
            </button>
          </div>

          {imageDrafts.length > 0 ? (
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
                {imageDrafts.map((draft) => {
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
                            loading="eager"
                            sizes="64px"
                            src={draft.imageUrl}
                            unoptimized
                          />
                        ) : null}
                        {draft.isThumbnail ? (
                          <span className="absolute inset-x-0 bottom-0 bg-primary/90 py-0.5 text-center text-[9px] font-medium text-primary-foreground">
                            Thumb
                          </span>
                        ) : null}
                      </button>
                      <button
                        aria-label="Remove image"
                        className="absolute -right-1.5 -top-1.5 z-20 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-surface"
                        disabled={isPending}
                        onClick={() => removeImageDraft(draft.clientId)}
                        type="button"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  );
                })}

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
              </div>
            </div>
          ) : null}

          {selected ? (
            <>
              <label className="block">
                <span className="text-sm font-medium">
                  Subtitle{" "}
                  <span className="font-normal text-muted">(optional)</span>
                </span>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
                  onChange={(event) =>
                    updateSelectedImageField("subtitle", event.target.value)
                  }
                  placeholder="Crown molding — living room"
                  value={selected.subtitle}
                />
                <span className="mt-1 block text-xs text-muted">
                  Shown on the photo; also used as alt text.
                </span>
              </label>

              <button
                className={cn(
                  "h-11 w-full rounded-xl border text-sm font-medium transition",
                  selected.isThumbnail
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-soft bg-surface text-foreground hover:border-border-strong",
                )}
                onClick={setSelectedAsThumbnail}
                type="button"
              >
                {selected.isThumbnail
                  ? "Thumbnail for list card"
                  : "Use as thumbnail"}
              </button>
              <p className="-mt-3 text-xs text-muted">
                This photo is shown as the cover on catalogue list pages.
              </p>
            </>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Display order</span>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm outline-none transition focus:border-border-strong"
                inputMode="numeric"
                onChange={(event) => setSortOrder(event.target.value)}
                value={sortOrder}
              />
              <span className="mt-1 block text-xs text-muted">
                Lower numbers show first.
              </span>
            </label>

            <div className="flex flex-col">
              <span className="text-sm font-medium">Published</span>
              <button
                className={cn(
                  "mt-2 h-11 rounded-xl border text-sm font-medium transition",
                  published
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-border-soft bg-surface text-muted",
                )}
                onClick={() => setPublished((value) => !value)}
                type="button"
              >
                {published ? "Live on site" : "Hidden (draft)"}
              </button>
            </div>
          </div>
        </div>

        <footer className="border-t border-border-soft px-4 py-3 sm:px-8">
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-70"
            disabled={isPending || !imageDrafts.length}
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
            ) : (
              "Add to catalogue"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
