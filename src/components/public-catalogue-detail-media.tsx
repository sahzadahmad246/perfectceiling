"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import { useCallback, useEffect, useRef, useState } from "react";

import { ImageLightbox } from "@/components/image-lightbox";
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
  const active = lightboxIndex !== null ? images[lightboxIndex] : null;
  const seoContext = { city, businessName };

  const markViewed = useCallback(async (imageId: string) => {
    if (!imageId.startsWith("preview-")) await recordContentView("catalogue_image", imageId);
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

    if (!imageId || imageId.startsWith("preview-")) {
      return;
    }

    void recordContentView("catalogue_image", imageId);
  }, [images, initialIndex]);

  if (!images.length) {
    return <p className="mt-6 text-sm text-muted">No images found</p>;
  }

  return (
    <>
      <div className="my-6 columns-2 gap-3" itemScope itemType="https://schema.org/ImageGallery">
        {images.map((image, index) => {
          const alt = getCatalogueImageAlt(image, groupTitle, seoContext);
          const subtitle = image.subtitle?.trim() || "";
          const caption = subtitle || `Design ${index + 1}`;
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
          caption={active.subtitle?.trim() || groupTitle}
          navigation={images.length > 1 ? {
            label: `${(lightboxIndex ?? 0) + 1} / ${images.length}`,
            onPrevious: () => openImage(((lightboxIndex ?? 0) - 1 + images.length) % images.length),
            onNext: () => openImage(((lightboxIndex ?? 0) + 1) % images.length),
          } : undefined}
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
  onOpen: () => void;
  onView: (imageId: string) => void;
};

function CatalogueImageFigure({
  image,
  alt,
  caption,
  href,
  isPriority,
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
        if (timer !== null) {
          window.clearTimeout(timer);
          timer = null;
        }
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
      className="mb-4 break-inside-avoid"
      itemScope
      itemType="https://schema.org/ImageObject"
      ref={figureRef}
    >
      <a
        className="group relative block overflow-hidden rounded-lg bg-[#e8e2d8] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]"
        href={href}
        itemProp="url"
        onClick={(event) => {
          event.preventDefault();
          onOpen();
        }}
      >
        <Image
          alt={alt}
          className="h-auto w-full transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
          height={900}
          itemProp="contentUrl"
          loading={isPriority ? "eager" : "lazy"}
          fetchPriority={isPriority ? "high" : "auto"}
          sizes="(max-width: 560px) calc((100vw - 44px) / 2), 242px"
          src={image.imageUrl}
          unoptimized={shouldBypassImageOptimization(image.imageUrl)}
          width={1200}
        />
      </a>
      <figcaption className="mt-2 flex items-start justify-between gap-2">
        <span itemProp="name" className="line-clamp-2 text-[11px] font-medium leading-5 text-[#514c43]">{caption}</span>
        <ArrowUpRight aria-hidden className="mt-1 shrink-0 text-[#91704a]" size={12} />
        <span itemProp="description" className="sr-only">{alt}</span>
      </figcaption>
    </figure>
  );
}
