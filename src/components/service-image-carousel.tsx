"use client";

import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import { useState } from "react";
import { ServiceImageLightbox } from "@/components/service-image-lightbox";
import type { ServiceGalleryImage } from "@/lib/services";

export function ServiceImageCarousel({ images, title }: { images: ServiceGalleryImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  if (!images.length) return null;
  const index = Math.min(activeIndex, images.length - 1);
  const activeImage = images[index];
  const rawCaption = activeImage.caption.trim();
  const displayCaption = /^\d+\.(?:png|jpe?g|webp|avif)$/i.test(rawCaption) ? "" : rawCaption;
  const caption = displayCaption || `${title} — photo ${index + 1}`;
  const move = (direction: number) => setActiveIndex((current) => (current + direction + images.length) % images.length);
  const start = Math.floor(index / 4) * 4;
  return <>
    <section aria-label={`${title} photos`} aria-roledescription="carousel" className="mt-6" onKeyDown={(event) => {
      if (images.length < 2) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
    }}>
      <button type="button" aria-label={`Open ${caption} fullscreen`} onClick={() => { setViewerIndex(index); setViewerOpen(true); }} className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg bg-[#e8e2d8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]">
        <Image key={activeImage.url} alt={caption} itemProp="image" fill src={activeImage.url} sizes="(max-width: 560px) calc(100vw - 32px), 496px" className="object-contain" loading="eager" fetchPriority={index === 0 ? "high" : "auto"} unoptimized={shouldBypassImageOptimization(activeImage.url)} />
        <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-[#f3f0e9]/95 text-[#292720]"><Maximize2 aria-hidden size={15} /></span>
      </button>
      <div className="mt-3 flex min-h-11 items-center justify-between gap-3">
        <p aria-live="polite" className="min-w-0 text-[11px] leading-5 text-[#827563]"><span className="font-medium tabular-nums text-[#292720]">{index + 1} / {images.length}</span>{displayCaption ? <span className="ml-3">{displayCaption}</span> : null}</p>
        {images.length > 1 ? <div className="flex shrink-0 items-center gap-1"><button aria-label="Previous photo" type="button" onClick={() => move(-1)} className="flex size-11 items-center justify-center rounded-full text-[#746e63] transition hover:bg-[#eee7db]"><ArrowLeft aria-hidden size={18} /></button><button aria-label="Next photo" type="button" onClick={() => move(1)} className="flex size-11 items-center justify-center rounded-full text-[#746e63] transition hover:bg-[#eee7db]"><ArrowRight aria-hidden size={18} /></button></div> : null}
      </div>
      {images.length > 1 ? <div className="mt-2 grid grid-cols-4 gap-2">{images.slice(start, start + 4).map((image, offset) => <button key={`${image.url}-${start + offset}`} type="button" aria-label={`Show photo ${start + offset + 1}`} aria-current={index === start + offset ? "true" : undefined} onClick={() => setActiveIndex(start + offset)} className={`relative aspect-[4/3] overflow-hidden rounded-md bg-[#e8e2d8] transition ${index === start + offset ? "outline-2 outline-offset-2 outline-[#91704a]" : "opacity-65 hover:opacity-100"}`}><Image alt={image.caption || `${title} photo ${start + offset + 1}`} src={image.url} fill sizes="120px" className="object-cover" unoptimized={shouldBypassImageOptimization(image.url)} /></button>)}</div> : null}
    </section>
    <ServiceImageLightbox images={images} initialIndex={viewerIndex} onClose={() => setViewerOpen(false)} open={viewerOpen} title={title} />
  </>;
}
