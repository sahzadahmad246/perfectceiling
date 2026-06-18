"use client";

import { ImageUp, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { uploadQuotationItemImage } from "@/app/admin/quotations/actions";
import type { QuotationLineItemImageDraft } from "@/lib/quotations";

type QuotationItemImageUploadModalProps = {
  open: boolean;
  itemId: string;
  onClose: () => void;
  onSave: (image: QuotationLineItemImageDraft) => void;
};

export function QuotationItemImageUploadModal({
  open,
  itemId,
  onClose,
  onSave,
}: QuotationItemImageUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription("");
    setUploading(false);
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!open) {
    return null;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
  }

  async function handleUpload() {
    if (!selectedFile || uploading) {
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("itemId", itemId);

    setUploading(true);

    try {
      const result = await uploadQuotationItemImage(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onSave({
        ...result.image,
        description: description.trim(),
      });
      onClose();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm">
      <button
        aria-label="Close image upload"
        className="absolute inset-0"
        disabled={uploading}
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 flex max-h-[min(88vh,680px)] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
          <div>
            <p className="text-[11px] text-muted">Work item</p>
            <h3 className="font-primary text-base font-medium">Add image</h3>
          </div>
          <button
            aria-label="Close image upload form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary disabled:opacity-70"
            disabled={uploading}
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <input
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            className="sr-only"
            disabled={uploading}
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />

          <div className="overflow-hidden rounded-xl border border-border-soft bg-surface-muted/40">
            {previewUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Selected image preview"
                  className="max-h-56 w-full object-contain bg-surface"
                  src={previewUrl}
                />
                <button
                  aria-label="Remove selected image"
                  className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border border-border-soft bg-surface-raised text-muted shadow-sm transition hover:text-foreground disabled:opacity-70"
                  disabled={uploading}
                  onClick={clearSelectedFile}
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                className="flex min-h-44 w-full flex-col items-center justify-center gap-2 px-4 py-8 text-muted transition hover:text-foreground disabled:opacity-70"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <ImageUp size={24} />
                <span className="text-sm font-medium text-foreground">
                  Choose image
                </span>
                <span className="text-xs text-muted">
                  PNG, JPG, or WEBP up to 5MB
                </span>
              </button>
            )}
          </div>

          {selectedFile ? (
            <p className="mt-2 text-center text-xs text-muted">
              {selectedFile.name} · {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          ) : null}

          <label className="mt-4 block text-sm font-medium text-foreground">
            Image description
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary disabled:opacity-70"
              disabled={uploading}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does this image show?"
              value={description}
            />
          </label>
        </div>

        <footer className="border-t border-border-soft px-4 py-3">
          <div className="flex gap-2">
            <button
              className="h-10 flex-1 rounded-full border border-border-strong text-sm font-medium disabled:opacity-70"
              disabled={uploading}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
              disabled={uploading || !selectedFile}
              onClick={() => void handleUpload()}
              type="button"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </>
              ) : (
                "Add image"
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}