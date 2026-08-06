"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type ImageLightboxProps = {
  open: boolean;
  src: string;
  alt: string;
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

export function ImageLightbox({
  open,
  src,
  alt,
  onClose,
}: ImageLightboxProps) {
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

  if (!open || !mounted) {
    return null;
  }

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

      <button
        aria-label="Close"
        className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 sm:right-5 sm:top-5"
        onClick={onClose}
        type="button"
      >
        <X size={22} strokeWidth={2.25} />
      </button>

      <div className="relative z-[1] h-full w-full max-w-5xl">
        <Image
          alt={alt}
          className="object-contain"
          fill
          priority
          sizes="100vw"
          src={src}
          unoptimized={src.startsWith("http") || src.startsWith("blob:")}
        />
      </div>
    </div>,
    document.body,
  );
}
