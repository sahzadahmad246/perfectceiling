"use client";

import { Download, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { ShareButton } from "@/components/share-button";

type ImageLightboxProps = {
  open: boolean;
  src: string;
  alt: string;
  /** Optional visible caption (e.g. image subtitle). */
  caption?: string | null;
  /** Suggested filename stem for downloads (extension inferred from URL). */
  downloadName?: string | null;
  /** Share payload for this image (shown next to close). */
  share?: {
    title: string;
    text: string;
    url: string;
  } | null;
  onClose: () => void;
};

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function buildDownloadFilename(src: string, downloadName?: string | null) {
  const path = src.split("?")[0] ?? src;
  const fromUrl = path.split("/").pop() || "image.jpg";
  const extensionMatch = fromUrl.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extensionMatch?.[1]?.toLowerCase() || "jpg";
  const base =
    downloadName
      ?.trim()
      .replace(/[^\w\s-]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "catalogue-image";

  return `${base}.${extension}`;
}

async function downloadImage(src: string, filename: string) {
  const response = await fetch(src, {
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Download failed.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function ImageLightbox({
  open,
  src,
  alt,
  caption,
  downloadName,
  share,
  onClose,
}: ImageLightboxProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  async function handleDownload(event: React.MouseEvent) {
    event.stopPropagation();

    if (isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadImage(src, buildDownloadFilename(src, downloadName ?? caption));
      toast.success("Image downloaded.");
    } catch {
      // Last resort: open original file in a new tab (full quality source).
      try {
        window.open(src, "_blank", "noopener,noreferrer");
      } catch {
        toast.error("Could not download image.");
      }
    } finally {
      setIsDownloading(false);
    }
  }

  if (!open || !mounted) {
    return null;
  }

  const visibleCaption = caption?.trim() || "";

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/92 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
    >
      <button
        aria-label="Close image"
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
        type="button"
      />

      <div className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-5 sm:top-5">
        <button
          aria-label="Download image"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-60"
          disabled={isDownloading}
          onClick={(event) => void handleDownload(event)}
          title="Download"
          type="button"
        >
          {isDownloading ? (
            <Loader2 className="animate-spin" size={20} strokeWidth={2.25} />
          ) : (
            <Download size={20} strokeWidth={2.25} />
          )}
        </button>

        {share ? (
          <ShareButton
            className="size-11"
            label="Share image"
            text={share.text}
            title={share.title}
            url={share.url}
            variant="icon-light"
          />
        ) : null}

        <button
          aria-label="Close"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
          onClick={onClose}
          type="button"
        >
          <X size={22} strokeWidth={2.25} />
        </button>
      </div>

      <div className="relative z-[1] flex h-full w-full max-w-5xl flex-col">
        <div className="relative min-h-0 flex-1">
          <Image
            alt={alt}
            className="object-contain"
            fill
            loading="eager"
            priority
            sizes="100vw"
            src={src}
            unoptimized={src.startsWith("http") || src.startsWith("blob:")}
          />
        </div>

        {visibleCaption ? (
          <p className="relative z-[1] shrink-0 px-2 pb-1 pt-3 text-center text-sm font-medium leading-6 text-white/95 sm:text-base">
            {visibleCaption}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
