"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ImageLightbox } from "@/components/image-lightbox";
import { ViewCount } from "@/components/view-count";
import {
  getCatalogueImageAlt,
  getCatalogueImagePublicPath,
} from "@/lib/catalogue";
import { getCatalogueImageShareUrl } from "@/lib/catalogue-seo";
import type { PublicCatalogueGroupImage } from "@/lib/public-content";
import { recordContentView } from "@/lib/views";

type PublicCatalogueDetailMediaProps = {
  groupId: string;
  groupTitle: string;
  images: PublicCatalogueGroupImage[];
  initialImageId?: string | null;
  city?: string | null;
  businessName?: string | null;
};

const VIEW_VISIBLE_MS = 1000;

export function PublicCatalogueDetailMedia({
  groupId,
  groupTitle,
  images,
  initialImageId,
  city,
  businessName,
}: PublicCatalogueDetailMediaProps) {
  const initialIndex = initialImageId
    ? images.findIndex((image) => image.id === initialImageId)
    : -1;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(
    initialIndex >= 0 ? initialIndex : null,
  );
  const [viewCounts, setViewCounts] = useState(() =>
    Object.fromEntries(images.map((image) => [image.id, image.viewCount])),
  );
  const active = lightboxIndex !== null ? images[lightboxIndex] : null;
  const seoContext = { city, businessName };

  const markViewed = useCallback(async (imageId: string) => {
    const incremented = await recordContentView("catalogue_image", imageId);

    if (incremented) {
      setViewCounts((current) => ({
        ...current,
        [imageId]: (current[imageId] ?? 0) + 1,
      }));
    }
  }, []);

  function openImage(index: number) {
    setLightboxIndex(index);
    const image = images[index];

    if (image) {
      void markViewed(image.id);
    }
  }

  useEffect(() => {
    if (initialIndex < 0) {
      return;
    }

    const imageId = images[initialIndex]?.id;

    if (!imageId) {
      return;
    }

    void recordContentView("catalogue_image", imageId).then((incremented) => {
      if (!incremented) {
        return;
      }

      setViewCounts((current) => ({
        ...current,
        [imageId]: (current[imageId] ?? 0) + 1,
      }));
    });
  }, [images, initialIndex]);

  if (!images.length) {
    return <p className="mt-6 text-sm text-muted">No images found</p>;
  }

  return (
    <>
      <div className="mt-6 space-y-5" itemScope itemType="https://schema.org/ImageGallery">
        {images.map((image, index) => {
          const alt = getCatalogueImageAlt(image, groupTitle, seoContext);
          const subtitle = image.subtitle?.trim() || "";
          const caption = subtitle || `${groupTitle} ceiling design`;
          const href = getCatalogueImagePublicPath(groupId, image.id);
          const isPriority = index === 0;

          return (
            <CatalogueImageFigure
              alt={alt}
              caption={caption}
              href={href}
              image={image}
              isPriority={isPriority}
              key={image.id}
              onOpen={() => openImage(index)}
              onView={markViewed}
              viewCount={viewCounts[image.id] ?? image.viewCount}
            />
          );
        })}
      </div>

      {active ? (
        <ImageLightbox
          alt={getCatalogueImageAlt(active, groupTitle, seoContext)}
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

type CatalogueImageFigureProps = {
  image: PublicCatalogueGroupImage;
  alt: string;
  caption: string;
  href: string;
  isPriority: boolean;
  viewCount: number;
  onOpen: () => void;
  onView: (imageId: string) => void;
};

function CatalogueImageFigure({
  image,
  alt,
  caption,
  href,
  isPriority,
  viewCount,
  onOpen,
  onView,
}: CatalogueImageFigureProps) {
  const figureRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const node = figureRef.current;

    if (!node || viewedRef.current) {
      return;
    }

    let timer: number | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = window.setTimeout(() => {
            if (viewedRef.current) {
              return;
            }

            viewedRef.current = true;
            observer.disconnect();
            onView(image.id);
          }, VIEW_VISIBLE_MS);
          return;
        }

        if (timer !== null) {
          window.clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();

      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [image.id, onView]);

  return (
    <figure
      className="overflow-hidden rounded-2xl border border-border-soft bg-surface-muted"
      itemScope
      itemType="https://schema.org/ImageObject"
      ref={figureRef}
    >
      <a
        className="relative block w-full text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        href={href}
        itemProp="url"
        onClick={(event) => {
          event.preventDefault();
          onOpen();
        }}
      >
        <Image
          alt={alt}
          className="h-auto max-h-[min(70vh,640px)] w-full object-contain"
          height={900}
          itemProp="contentUrl"
          loading={isPriority ? "eager" : "lazy"}
          priority={isPriority}
          sizes="(max-width: 560px) 100vw, 560px"
          src={image.imageUrl}
          unoptimized={image.imageUrl.startsWith("http")}
          width={1200}
        />
        <ViewCount
          className="absolute right-3 top-3"
          count={viewCount}
          variant="on-image"
        />
      </a>
      <figcaption className="sr-only">
        <span itemProp="name">{caption}</span>
        <span itemProp="description">{alt}</span>
      </figcaption>
    </figure>
  );
}
