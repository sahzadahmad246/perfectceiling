"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { ServiceGalleryImage } from "@/lib/services";

type ServiceImageLightboxProps = {
  open: boolean;
  images: ServiceGalleryImage[];
  initialIndex?: number;
  title: string;
  onClose: () => void;
};

const controlClass =
  "inline-flex items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70";

export function ServiceImageLightbox(props: ServiceImageLightboxProps) {
  if (!props.open || !props.images.length) return null;
  return <ServiceImageLightboxViewer key={`${props.initialIndex ?? 0}-${props.images.length}`} images={props.images} initialIndex={props.initialIndex} title={props.title} onClose={props.onClose} />;
}

function ServiceImageLightboxViewer({
  images,
  initialIndex = 0,
  title,
  onClose,
}: Omit<ServiceImageLightboxProps, "open">) {
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, Math.min(initialIndex, images.length - 1)));
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const hasMultiple = images.length > 1;
  const activeImage = images[activeIndex];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled]):not([tabindex='-1'])") ?? []);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
          event.preventDefault(); first?.focus();
        }
      }

      if (event.key === "ArrowLeft" && hasMultiple) {
        event.preventDefault();
        setActiveIndex((current) =>
          current === 0 ? images.length - 1 : current - 1,
        );
      }

      if (event.key === "ArrowRight" && hasMultiple) {
        event.preventDefault();
        setActiveIndex((current) =>
          current === images.length - 1 ? 0 : current + 1,
        );
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [hasMultiple, images.length, onClose]);

  if (!activeImage) {
    return null;
  }

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  const rawCaption = activeImage.caption.trim();
  const caption =
    (/^\d+\.(?:png|jpe?g|webp|avif)$/i.test(rawCaption) ? "" : rawCaption) ||
    `${title} — photo ${activeIndex + 1} of ${images.length}`;

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[10030] h-dvh w-full overflow-hidden bg-black/92 backdrop-blur-md">
      <button
        aria-label="Close image preview"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
        tabIndex={-1}
      />

      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-white backdrop-blur-sm">
          <p id={titleId} className="truncate text-sm font-medium">{title}</p>
          {hasMultiple ? (
            <p className="text-xs text-white/70">
              {activeIndex + 1} of {images.length}
            </p>
          ) : null}
        </div>

        <button
          ref={closeRef}
          aria-label="Dismiss image preview"
          className={`${controlClass} size-11 shrink-0`}
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 pb-28 pt-20 sm:px-16 sm:pb-32">
        {hasMultiple ? (
          <button
            aria-label="Previous image"
            className={`${controlClass} absolute left-3 top-1/2 z-20 size-11 -translate-y-1/2 sm:left-6 sm:size-12`}
            onClick={showPrevious}
            type="button"
          >
            <ChevronLeft size={22} />
          </button>
        ) : null}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={caption}
          className="relative z-10 max-h-full max-w-full object-contain"
          src={activeImage.url}
        />

        {hasMultiple ? (
          <button
            aria-label="Next image"
            className={`${controlClass} absolute right-3 top-1/2 z-20 size-11 -translate-y-1/2 sm:right-6 sm:size-12`}
            onClick={showNext}
            type="button"
          >
            <ChevronRight size={22} />
          </button>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pb-5 pt-10 sm:px-6 sm:pb-6">
        <p className="text-[11px] uppercase tracking-wide text-white/60">
          Caption
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white">
          {caption}
        </p>
      </div>
    </div>
  );
}
