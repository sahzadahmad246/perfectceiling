"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { HeroSlide } from "@/lib/public-content";
import { cn } from "@/lib/utils";

export function HeroMediaCarousel({ slides, className }: { slides: HeroSlide[]; className?: string }) {
  const photos = slides.filter((slide) => slide.mediaType === "image" && slide.mediaUrl).slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [requestedSlides, setRequestedSlides] = useState(() => new Set([0]));
  const [loadedSlides, setLoadedSlides] = useState(() => new Set<number>());
  const activeIndex = index % (photos.length || 1);
  const active = photos[activeIndex];

  useEffect(() => {
    if (!loadedSlides.has(activeIndex) || paused || reducedMotion || photos.length < 2) return;
    const next = (activeIndex + 1) % photos.length;
    if (requestedSlides.has(next)) return;
    const timer = setTimeout(() => setRequestedSlides((current) => new Set(current).add(next)), 1200);
    return () => clearTimeout(timer);
  }, [activeIndex, loadedSlides, requestedSlides, paused, reducedMotion, photos.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || interacting || reducedMotion || photos.length < 2 || !loadedSlides.has(activeIndex) || !loadedSlides.has((activeIndex + 1) % photos.length)) return;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % photos.length), 6000);
    return () => clearTimeout(timer);
  }, [index, activeIndex, paused, interacting, reducedMotion, photos.length, loadedSlides]);

  function navigate(next: number) {
    const target = (next + photos.length) % photos.length;
    setRequestedSlides((current) => new Set(current).add(target));
    setPaused(true);
    setIndex(target);
  }

  if (!active) {
    return (
      <div className={cn("rounded-2xl border border-[#dcd5c8] bg-white/40 p-6", className)}>
        <p className="text-sm leading-6 text-[#746e63]">Have a ceiling design in mind? Share your room photos and ideas with us to plan your space.</p>
      </div>
    );
  }

  return (
    <section
      aria-label="Ceiling designs from our catalogue and portfolio"
      aria-roledescription="carousel"
      className={cn("overflow-hidden rounded-2xl bg-[#292720] shadow-[0_16px_36px_-24px_rgba(41,39,32,0.5)]", className)}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          navigate(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
        }
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[5/4]">
        {photos.map((slide, slideIndex) => requestedSlides.has(slideIndex) || slideIndex === activeIndex ? (
          <div
            aria-hidden={slideIndex !== activeIndex}
            aria-label={`${slideIndex + 1} of ${photos.length}: ${slide.overlayTitle}`}
            aria-roledescription="slide"
            role="group"
            className={cn("absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none", slideIndex === activeIndex ? "opacity-100" : "opacity-0")}
            key={slide.id}
          >
            <Image
              alt={slide.overlayTitle}
              className="object-cover"
              fill
              preload={slideIndex === 0}
              loading={slideIndex === 0 ? undefined : "eager"}
              fetchPriority={slideIndex === 0 ? undefined : "low"}
              onLoad={() => setLoadedSlides((current) => current.has(slideIndex) ? current : new Set(current).add(slideIndex))}
              sizes="(max-width: 559px) calc(100vw - 32px), (max-width: 639px) 528px, 496px"
              src={slide.mediaUrl}
              unoptimized={shouldBypassImageOptimization(slide.mediaUrl)}
            />
          </div>
        ) : null)}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" aria-hidden />
        <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-md">Design inspiration</span>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5" aria-live={paused || reducedMotion ? "polite" : "off"} aria-atomic="true">
          {active.href ? (
            <Link className="group flex items-center justify-between gap-4 rounded-sm text-white focus-visible:outline-2 focus-visible:outline-offset-4" href={active.href}>
              <span className="font-primary text-lg font-medium leading-snug">{active.overlayTitle}</span>
              <ArrowUpRight className="shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden size={20} />
            </Link>
          ) : <p className="font-primary text-lg text-white">{active.overlayTitle}</p>}
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/75">{active.href?.startsWith("/catalogue") ? "From our design catalogue" : active.overlaySubtitle || "From our portfolio"}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-white">
        <span className="hidden pl-1 text-[11px] tabular-nums text-white/60 min-[400px]:block">{String(activeIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
        {photos.length > 1 ? <>
          <div className="flex items-center">
            {photos.map((slide, slideIndex) => (
              <button
                aria-label={`Show image ${slideIndex + 1}: ${slide.overlayTitle}`}
                aria-current={slideIndex === activeIndex ? "true" : undefined}
                className="flex min-h-11 min-w-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
                key={slide.id}
                onClick={() => navigate(slideIndex)}
                type="button"
              >
                <span className={cn("h-1 rounded-full transition-all motion-reduce:transition-none", slideIndex === activeIndex ? "w-5 bg-[#dcc6a6]" : "w-1.5 bg-white/30")} />
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <button aria-label="Previous image" className="flex size-11 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2" onClick={() => navigate(activeIndex - 1)} type="button"><ChevronLeft aria-hidden size={17} /></button>
            <button aria-label={paused ? "Play slideshow" : "Pause slideshow"} aria-hidden={reducedMotion || undefined} disabled={reducedMotion} tabIndex={reducedMotion ? -1 : 0} className={cn("flex size-11 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2", reducedMotion && "invisible")} onClick={() => setPaused((current) => !current)} type="button">{paused ? <Play aria-hidden size={14} /> : <Pause aria-hidden size={14} />}</button>
            <button aria-label="Next image" className="flex size-11 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2" onClick={() => navigate(activeIndex + 1)} type="button"><ChevronRight aria-hidden size={17} /></button>
          </div>
        </> : null}
      </div>
    </section>
  );
}
