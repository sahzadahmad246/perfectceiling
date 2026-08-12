"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { ImageLightbox } from "@/components/image-lightbox";
import { getCatalogueImageAlt } from "@/lib/catalogue";
import { getCatalogueImageShareUrl } from "@/lib/catalogue-seo";
import type { PublicCatalogueGroupImage } from "@/lib/public-content";

type PublicCatalogueDetailMediaProps = {
  groupId: string;
  groupTitle: string;
  images: PublicCatalogueGroupImage[];
  initialImageId?: string | null;
};

export function PublicCatalogueDetailMedia({
  groupId,
  groupTitle,
  images,
  initialImageId,
}: PublicCatalogueDetailMediaProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const active = lightboxIndex !== null ? images[lightboxIndex] : null;

  useEffect(() => {
    if (!initialImageId) {
      return;
    }

    const index = images.findIndex((image) => image.id === initialImageId);

    if (index >= 0) {
      setLightboxIndex(index);
    }
  }, [initialImageId, images]);

  if (!images.length) {
    return <p className="mt-6 text-sm text-muted">No images found</p>;
  }

  return (
    <>
      <div className="mt-6 space-y-4">
        {images.map((image, index) => {
          const alt = getCatalogueImageAlt(image, groupTitle);
          const subtitle = image.subtitle?.trim() || "";

          return (
            <button
              className="block w-full overflow-hidden rounded-2xl border border-border-soft bg-surface-muted text-left transition hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              key={image.id}
              onClick={() => setLightboxIndex(index)}
              type="button"
            >
              <div className="relative flex w-full items-center justify-center">
                <Image
                  alt={alt}
                  className="h-auto max-h-[min(70vh,640px)] w-full object-contain"
                  height={900}
                  loading="eager"
                  priority={index === 0}
                  sizes="(max-width: 560px) 100vw, 560px"
                  src={image.imageUrl}
                  unoptimized={image.imageUrl.startsWith("http")}
                  width={1200}
                />
                {subtitle ? (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pb-3 pt-10">
                    <span className="line-clamp-2 text-sm font-medium text-white">
                      {subtitle}
                    </span>
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {active ? (
        <ImageLightbox
          alt={getCatalogueImageAlt(active, groupTitle)}
          caption={active.subtitle}
          downloadName={active.subtitle?.trim() || groupTitle}
          onClose={() => setLightboxIndex(null)}
          open={lightboxIndex !== null}
          share={{
            title: active.subtitle?.trim() || groupTitle,
            text: active.subtitle?.trim()
              ? `${active.subtitle.trim()} — ${groupTitle}`
              : groupTitle,
            url: getCatalogueImageShareUrl(groupId, active.id),
          }}
          src={active.imageUrl}
        />
      ) : null}
    </>
  );
}
