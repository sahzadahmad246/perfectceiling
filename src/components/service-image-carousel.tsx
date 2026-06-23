"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";

import { ServiceImageLightbox } from "@/components/service-image-lightbox";
import type { ServiceGalleryImage } from "@/lib/services";
import { cn } from "@/lib/utils";

type ServiceImageCarouselProps = {
  images: ServiceGalleryImage[];
  title: string;
};

export function ServiceImageCarousel({
  images,
  title,
}: ServiceImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const slideCount = images.length;

  const goToPrevious = useCallback(() => {
    if (slideCount <= 1) {
      return;
    }

    setActiveIndex((current) => (current - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goToNext = useCallback(() => {
    if (slideCount <= 1) {
      return;
    }

    setActiveIndex((current) => (current + 1) % slideCount);
  }, [slideCount]);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  if (slideCount === 0) {
    return null;
  }

  const activeImage = images[activeIndex];
  const activeCaption =
    activeImage.caption.trim() ||
    `${title} — photo ${activeIndex + 1} of ${slideCount}`;

  return (
    <>
      <section
        aria-label={`${title} photos`}
        aria-roledescription="carousel"
        className="mt-5"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border-soft bg-surface-muted">
          <button
            aria-label={`View ${activeCaption} fullscreen`}
            className="absolute inset-0 z-[1] cursor-zoom-in"
            onClick={() => openViewer(activeIndex)}
            type="button"
          />

          <Image
            alt={activeCaption}
            itemProp="image"
            className="pointer-events-none object-cover"
            fill
            priority={activeIndex === 0}
            sizes="560px"
            src={activeImage.url}
            unoptimized={activeImage.url.startsWith("http")}
          />

          {slideCount > 1 ? (
            <>
              <button
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-[2] inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-surface/90 text-foreground backdrop-blur-sm transition hover:bg-surface"
                onClick={goToPrevious}
                type="button"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-[2] inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-surface/90 text-foreground backdrop-blur-sm transition hover:bg-surface"
                onClick={goToNext}
                type="button"
              >
                <ChevronRight size={18} />
              </button>

              <div className="absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border-soft bg-surface/90 px-3 py-1.5 backdrop-blur-sm">
                {images.map((image, index) => (
                  <button
                    aria-current={index === activeIndex}
                    aria-label={`Show photo ${index + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === activeIndex
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-border-strong hover:bg-muted",
                    )}
                    key={image.url}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {slideCount > 1 ? (
          <p className="mt-2 text-center text-xs text-muted">
            {activeIndex + 1} / {slideCount}
          </p>
        ) : null}
      </section>

      <ServiceImageLightbox
        images={images}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
        open={viewerOpen}
        title={title}
      />
    </>
  );
}