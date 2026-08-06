"use client";

import Image from "next/image";
import { useState } from "react";

import { ImageLightbox } from "@/components/image-lightbox";

type PublicCatalogueDetailMediaProps = {
  imageUrl: string;
  alt: string;
  title: string;
};

export function PublicCatalogueDetailMedia({
  imageUrl,
  alt,
  title,
}: PublicCatalogueDetailMediaProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <button
        className="relative mt-6 block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border-soft bg-surface-muted"
        onClick={() => setLightboxOpen(true)}
        type="button"
      >
        <Image
          alt={alt}
          className="object-cover"
          fill
          itemProp="image"
          priority
          sizes="(max-width: 560px) 100vw, 560px"
          src={imageUrl}
          title={title}
          unoptimized={imageUrl.startsWith("http")}
        />
      </button>

      <p className="mt-3 text-xs text-muted">
        Tap the photo to view full screen.
      </p>

      <ImageLightbox
        alt={alt}
        onClose={() => setLightboxOpen(false)}
        open={lightboxOpen}
        src={imageUrl}
      />
    </>
  );
}
