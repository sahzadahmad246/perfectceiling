"use client";

import { Quote } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { GoogleReviewAvatar } from "@/components/google-review-avatar";
import { StarRating } from "@/components/star-rating";
import type { GoogleReview } from "@/lib/google-reviews";

const AUTO_SLIDE_MS = 4500;

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

type GoogleReviewsCarouselProps = {
  reviews: GoogleReview[];
};

export function GoogleReviewsCarousel({ reviews }: GoogleReviewsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const getStep = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      return 0;
    }

    const card = el.querySelector<HTMLElement>("[data-review-card]");
    return card ? card.offsetWidth + 12 : el.clientWidth * 0.85;
  }, []);

  const scrollByDir = useCallback(
    (dir: "left" | "right", options?: { loop?: boolean }) => {
      const el = scrollerRef.current;

      if (!el) {
        return;
      }

      const step = getStep();
      const max = el.scrollWidth - el.clientWidth;

      if (dir === "right") {
        if (el.scrollLeft >= max - 4) {
          if (options?.loop) {
            el.scrollTo({ left: 0, behavior: "smooth" });
          }
          return;
        }

        el.scrollBy({ left: step, behavior: "smooth" });
        return;
      }

      if (el.scrollLeft <= 4) {
        if (options?.loop) {
          el.scrollTo({ left: max, behavior: "smooth" });
        }
        return;
      }

      el.scrollBy({ left: -step, behavior: "smooth" });
    },
    [getStep],
  );

  useEffect(() => {
    if (reviews.length <= 1 || paused || prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      scrollByDir("right", { loop: true });
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [paused, prefersReducedMotion, reviews.length, scrollByDir]);

  if (!reviews.length) {
    return null;
  }

  return (
    <div
      className="relative mt-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => {
        window.setTimeout(() => setPaused(false), 2500);
      }}
    >
      <div
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={scrollerRef}
      >
        {reviews.map((review) => (
          <article
            className="relative w-[min(100%,calc(100%-1.75rem))] shrink-0 snap-start overflow-hidden rounded-2xl border border-border-soft bg-surface-raised p-4 shadow-[0_10px_28px_rgba(24,24,27,0.05)] sm:w-[min(100%,calc(100%-2.25rem))]"
            data-review-card
            key={review.id}
          >
            <Quote
              aria-hidden
              className="pointer-events-none absolute -right-0.5 top-2 text-amber-100/90"
              size={40}
              strokeWidth={1.25}
            />

            <div className="relative flex items-center gap-3">
              <GoogleReviewAvatar
                name={review.authorName}
                photoUrl={review.authorPhotoUrl}
              />
              <div className="min-w-0 flex-1">
                {review.authorUrl ? (
                  <a
                    className="block truncate text-sm font-medium text-foreground hover:underline"
                    href={review.authorUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {review.authorName}
                  </a>
                ) : (
                  <p className="truncate text-sm font-medium text-foreground">
                    {review.authorName}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <StarRating rating={review.rating} size={12} />
                  {review.relativeTime ? (
                    <span className="text-[11px] text-muted">
                      {review.relativeTime}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {review.text ? (
              <p className="relative mt-3 line-clamp-5 text-sm leading-6 text-muted">
                {review.text}
              </p>
            ) : (
              <p className="relative mt-3 text-sm italic text-subtle">
                Rated {review.rating} stars on Google
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
