"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { HeroSlide } from "@/lib/public-content";
import { cn } from "@/lib/utils";

type HeroMediaCarouselProps = {
  slides: HeroSlide[];
  badge?: string;
  children?: ReactNode;
  extendUnderHeader?: boolean;
  className?: string;
};

function themeClass(theme: HeroSlide["theme"]) {
  if (theme === "shops") {
    return "hero-slide-theme-shops";
  }

  if (theme === "offices") {
    return "hero-slide-theme-offices";
  }

  return "hero-slide-theme-homes";
}

export function HeroMediaCarousel({
  slides,
  badge,
  children,
  extendUnderHeader = false,
  className,
}: HeroMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slideCount = slides.length;
  const activeSlide = slides[activeIndex] ?? slides[0];

  const goToNext = useCallback(() => {
    if (slideCount <= 1) {
      return;
    }

    setActiveIndex((current) => (current + 1) % slideCount);
  }, [slideCount]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    if (!activeSlide || prefersReducedMotion || slideCount <= 1) {
      return;
    }

    if (activeSlide.mediaType === "video") {
      return;
    }

    timerRef.current = setTimeout(goToNext, activeSlide.durationMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [
    activeIndex,
    activeSlide,
    goToNext,
    prefersReducedMotion,
    slideCount,
  ]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || activeSlide?.mediaType !== "video") {
      return;
    }

    function handleEnded() {
      if (!prefersReducedMotion) {
        goToNext();
      }
    }

    video.currentTime = 0;
    void video.play().catch(() => undefined);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [activeIndex, activeSlide, goToNext, prefersReducedMotion]);

  if (!activeSlide) {
    return null;
  }

  const isPhotoSlide =
    activeSlide.mediaType === "image" || activeSlide.mediaType === "video";

  const shellMinHeight = extendUnderHeader
    ? "min-h-[26rem] sm:min-h-[28rem]"
    : "min-h-[22rem] sm:min-h-[24rem]";

  return (
    <section
      aria-label="Featured ceiling work"
      aria-roledescription="carousel"
      className={cn(
        "animate-rise w-full",
        !extendUnderHeader && "-mx-4 sm:-mx-8",
        className,
      )}
    >
      <div
        className={cn(
          "hero-carousel-shell relative overflow-hidden",
          shellMinHeight,
        )}
      >
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                isActive ? "opacity-100" : "opacity-0",
              )}
              key={slide.id}
            >
              {slide.mediaType === "animated" ? (
                <div
                  className={cn(
                    "hero-grid hero-slide-theme absolute inset-0",
                    themeClass(slide.theme),
                    isActive &&
                      !prefersReducedMotion &&
                      "animate-hero-theme-drift",
                  )}
                />
              ) : slide.mediaType === "video" ? (
                <video
                  ref={isActive ? videoRef : undefined}
                  autoPlay={isActive}
                  className="h-full w-full object-cover"
                  loop={prefersReducedMotion || slideCount === 1}
                  muted
                  playsInline
                  poster={slide.posterUrl ?? undefined}
                  preload={isActive ? "auto" : "metadata"}
                  src={slide.mediaUrl}
                />
              ) : (
                <Image
                  alt=""
                  className={cn(
                    "object-cover",
                    isActive &&
                      !prefersReducedMotion &&
                      "animate-hero-ken-burns",
                  )}
                  fill
                  priority={index === 0}
                  sizes="560px"
                  src={slide.mediaUrl}
                  unoptimized={slide.mediaUrl.startsWith("http")}
                />
              )}

              {slide.mediaType !== "animated" ? (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/15" />
              ) : null}
            </div>
          );
        })}

        <div
          className={cn(
            "relative z-10 flex h-full flex-col justify-end px-4 pb-5 sm:px-8 sm:pb-6",
            shellMinHeight,
            extendUnderHeader ? "pt-16" : "pt-8",
          )}
        >
          {badge ? (
            <div
              className={cn(
                "mb-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs backdrop-blur-sm",
                isPhotoSlide
                  ? "border border-white/20 bg-black/45 text-white/85"
                  : "border border-border-strong bg-surface-raised/85 text-muted",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  isPhotoSlide ? "bg-white" : "bg-primary",
                )}
              />
              {badge}
            </div>
          ) : null}

          <div className="relative min-h-[6.5rem]">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              const slideIsPhoto =
                slide.mediaType === "image" || slide.mediaType === "video";

              return (
                <div
                  className={cn(
                    "transition-all duration-500",
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none absolute inset-x-0 translate-y-2 opacity-0",
                  )}
                  key={`copy-${slide.id}`}
                >
                  {slide.href ? (
                    <Link
                      className={cn(
                        "font-primary text-[27px] font-semibold leading-[1.12] tracking-[-0.02em] transition hover:opacity-90 sm:text-[32px]",
                        slideIsPhoto ? "text-white" : "text-foreground",
                      )}
                      href={slide.href}
                    >
                      {slide.overlayTitle}
                    </Link>
                  ) : (
                    <h1
                      className={cn(
                        "font-primary text-[27px] font-semibold leading-[1.12] tracking-[-0.02em] sm:text-[32px]",
                        slideIsPhoto ? "text-white" : "text-foreground",
                      )}
                    >
                      {slide.overlayTitle}
                    </h1>
                  )}
                  {slide.overlaySubtitle ? (
                    <p
                      className={cn(
                        "mt-3 max-w-[34rem] text-[15px] leading-7 sm:text-[16px]",
                        slideIsPhoto ? "text-white/80" : "text-muted",
                      )}
                    >
                      {slide.overlaySubtitle}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {children ? (
            <div
              className={cn(
                "mt-6",
                isPhotoSlide &&
                  "[&_a:first-child]:bg-white [&_a:first-child]:text-primary [&_a:first-child]:hover:bg-white/90 [&_a:last-child]:border-white/70 [&_a:last-child]:bg-white/10 [&_a:last-child]:text-white [&_a:last-child]:backdrop-blur-sm [&_a:last-child]:hover:border-white [&_a:last-child]:hover:bg-white/20",
              )}
            >
              {children}
            </div>
          ) : null}

          {slideCount > 1 ? (
            <div className="mt-5 flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  aria-current={index === activeIndex}
                  aria-label={`Show slide ${index + 1}: ${slide.overlayTitle}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === activeIndex
                      ? cn("w-7", isPhotoSlide ? "bg-white" : "bg-primary")
                      : cn(
                          "w-2",
                          isPhotoSlide
                            ? "bg-white/35 hover:bg-white/55"
                            : "bg-border-strong hover:bg-muted",
                        ),
                  )}
                  key={`dot-${slide.id}`}
                  onClick={() => goToSlide(index)}
                  type="button"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}