"use client";

import { ImageUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteQuotationItemImage } from "@/app/admin/quotations/actions";
import { QuotationItemImageUploadModal } from "@/components/quotation-item-image-upload-modal";
import { QuotationItemImageViewer } from "@/components/quotation-item-image-viewer";
import {
  MAX_QUOTATION_ITEM_IMAGES,
  type QuotationLineItemImageDraft,
} from "@/lib/quotations";

type QuotationItemImagePickerProps = {
  itemId: string;
  images: QuotationLineItemImageDraft[];
  onChange: (images: QuotationLineItemImageDraft[]) => void;
  disabled?: boolean;
};

export function QuotationItemImagePicker({
  itemId,
  images,
  onChange,
  disabled = false,
}: QuotationItemImagePickerProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const canAddMore = images.length < MAX_QUOTATION_ITEM_IMAGES;

  function openViewer(index: number) {
    setViewerIndex(index);
    setViewerOpen(true);
  }

  async function handleRemove(image: QuotationLineItemImageDraft) {
    if (disabled || removingId) {
      return;
    }

    setRemovingId(image.id);

    try {
      if (image.storagePath) {
        const result = await deleteQuotationItemImage(image.storagePath);

        if (!result.success) {
          toast.error(result.error);
          return;
        }
      }

      onChange(images.filter((current) => current.id !== image.id));
    } finally {
      setRemovingId(null);
    }
  }

  function updateDescription(imageId: string, description: string) {
    onChange(
      images.map((image) =>
        image.id === imageId ? { ...image, description } : image,
      ),
    );
  }

  return (
    <>
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ImageUp className="text-muted" size={16} />
            <span>Item images</span>
          </div>
          <span className="text-xs text-muted">
            {images.length}/{MAX_QUOTATION_ITEM_IMAGES}
          </span>
        </div>

        {images.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {images.map((image, index) => {
              const isRemoving = removingId === image.id;

              return (
                <li
                  className="overflow-hidden rounded-xl border border-border-soft bg-surface-raised/70"
                  key={image.id}
                >
                  <button
                    className="block w-full text-left"
                    disabled={disabled || isRemoving}
                    onClick={() => openViewer(index)}
                    type="button"
                  >
                    <div className="relative bg-surface-muted/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={image.description.trim() || "Item image"}
                        className="max-h-44 w-full object-contain"
                        src={image.url}
                      />
                    </div>
                  </button>

                  <div className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {image.fileName || `Image ${index + 1}`}
                        </p>
                        <button
                          className="mt-1 text-xs text-primary underline underline-offset-2"
                          disabled={disabled || isRemoving}
                          onClick={() => openViewer(index)}
                          type="button"
                        >
                          Preview image
                        </button>
                      </div>
                      <button
                        aria-label="Remove image"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-70"
                        disabled={disabled || isRemoving}
                        onClick={() => void handleRemove(image)}
                        type="button"
                      >
                        {isRemoving ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>

                    <label className="block text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Pencil size={11} />
                        Image description
                      </span>
                      <input
                        className="mt-1 h-9 w-full rounded-md border border-border-strong bg-surface px-2.5 text-sm outline-none transition focus:border-primary disabled:opacity-70"
                        disabled={disabled || isRemoving}
                        onChange={(event) =>
                          updateDescription(image.id, event.target.value)
                        }
                        placeholder="What does this image show?"
                        value={image.description}
                      />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-border-strong bg-surface-muted/40 px-4 py-5 text-center text-sm text-muted">
            No images added yet.
          </p>
        )}

        {canAddMore ? (
          <button
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-sm font-medium transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled}
            onClick={() => setUploadOpen(true)}
            type="button"
          >
            <Plus size={16} />
            {images.length === 0 ? "Add image" : "Add another image"}
          </button>
        ) : null}
      </div>

      <QuotationItemImageUploadModal
        itemId={itemId}
        onClose={() => setUploadOpen(false)}
        onSave={(image) => onChange([...images, image])}
        open={uploadOpen}
      />

      <QuotationItemImageViewer
        images={images}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
        open={viewerOpen}
      />
    </>
  );
}