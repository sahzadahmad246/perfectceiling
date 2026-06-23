"use client";

import { ChevronLeft, ChevronRight, Hammer } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import type { ServiceGalleryImage } from "@/lib/services";
import { cn } from "@/lib/utils";

type PublicServiceCardMediaProps = {
  images: ServiceGalleryImage[];
  title: string;
  imageAlt: string;
};

export function PublicServiceCardMedia({
  images,
  title,
  imageAlt,
}: PublicServiceCardMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = images.length;
  const hasMultiple = slideCount > 1;

  const goToPrevious = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!hasMultiple) {
        return;
      }

      setActiveIndex((current) => (current - 1 + slideCount) % slideCount);
    },
    [hasMultiple, slideCount],
  );

  const goToNext = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!hasMultiple) {
        return;
      }

      setActiveIndex((current) => (current + 1) % slideCount);
    },
    [hasMultiple, slideCount],
  );

  const goToSlide = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
      event.preventDefault();
      event.stopPropagation();
      setActiveIndex(index);
    },
    [],
  );

  if (slideCount === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        <div className="flex h-full items-center justify-center text-muted">
          <Hammer size={28} strokeWidth={1.75} />
        </div>
      </div>
    );
  }

  const activeImage = images[activeIndex];
  const activeAlt =
    activeImage.caption.trim() ||
    `${imageAlt} — photo ${activeIndex + 1} of ${slideCount}`;

  return (
    <div
      aria-label={`${title} photos`}
      aria-roledescription={hasMultiple ? "carousel" : undefined}
      className="relative aspect-[16/10] overflow-hidden bg-surface-muted"
    >
      <Image
        alt={activeAlt}
        className="object-cover transition duration-300 group-hover:scale-[1.02]"
        fill
        priority={activeIndex === 0}
        sizes="560px"
        src={activeImage.url}
        unoptimized={activeImage.url.startsWith("http")}
      />

      {hasMultiple ? (
        <>
          <button
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-[2] inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-surface/90 text-foreground backdrop-blur-sm transition hover:bg-surface"
            onClick={goToPrevious}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-[2] inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-surface/90 text-foreground backdrop-blur-sm transition hover:bg-surface"
            onClick={goToNext}
            type="button"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute bottom-2 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border-soft bg-surface/90 px-2.5 py-1 backdrop-blur-sm">
            {images.map((image, index) => (
              <button
                aria-current={index === activeIndex}
                aria-label={`Show photo ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "w-5 bg-primary"
                    : "w-1.5 bg-border-strong hover:bg-muted",
                )}
                key={image.url}
                onClick={(event) => goToSlide(event, index)}
                type="button"
              />
            ))}
          </div>

          <span className="absolute right-2 top-2 z-[2] rounded-full border border-border-soft bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm">
            {activeIndex + 1}/{slideCount}
          </span>
        </>
      ) : null}
    </div>
  );
}