"use client";

import { ChevronLeft, ChevronRight, Pause, Play, Quote } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { GoogleReviewAvatar } from "@/components/google-review-avatar";
import { StarRating } from "@/components/star-rating";
import type { GoogleReview } from "@/lib/google-reviews";

export function GoogleReviewsCarousel({ reviews }: { reviews: GoogleReview[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = reviews.length;
  const activeIndex = index % (count || 1);
  const review = reviews[activeIndex];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (count < 2 || paused || interacting || reducedMotion || hidden || expanded) return;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % count), 7000);
    return () => clearTimeout(timer);
  }, [count, index, paused, interacting, reducedMotion, hidden, expanded]);

  function navigate(next: number) {
    if (!count) return;
    setIndex((next + count) % count);
    setExpanded(false);
    setPaused(true);
  }

  if (!review) return null;
  const date = review.publishTime ? new Date(review.publishTime) : null;
  const published = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null;
  const longReview = review.text.length > 240;

  return (
    <div
      aria-label="Client reviews"
      aria-roledescription="carousel"
      role="region"
      className="mt-4"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const end = event.changedTouches[0]?.clientX;
        if (touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 45) navigate(activeIndex + (end < touchStart.current ? 1 : -1));
        touchStart.current = null;
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          navigate(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
        }
      }}
    >
      <div aria-live={paused || reducedMotion ? "polite" : "off"} aria-atomic="true">
        <article key={review.id} aria-label={`Review ${activeIndex + 1} of ${count}`} aria-roledescription="slide" className="flex min-h-[230px] flex-col py-2 motion-safe:animate-fade-in">
          <Quote aria-hidden className="text-[#b19672]" size={30} strokeWidth={1.2} />
          <p className="mt-3 font-primary text-[17px] leading-8 tracking-[-0.015em] text-[#514332]">{review.text ? expanded || !longReview ? review.text : `${review.text.slice(0, 240).trim()}…` : `Rated ${review.rating} out of 5 on Google.`}</p>
          {longReview ? <button type="button" aria-expanded={expanded} onClick={() => { setExpanded((current) => !current); setPaused(true); }} className="mt-2 inline-flex min-h-11 w-fit items-center text-xs font-medium text-[#91704a] underline underline-offset-4">{expanded ? "Show less" : "Read full review"}</button> : null}
          <div className="mt-auto flex items-center gap-3 pt-5"><GoogleReviewAvatar name={review.authorName} photoUrl={review.authorPhotoUrl} /><div className="min-w-0">{review.authorUrl ? <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-xs font-semibold text-[#292720] hover:underline">{review.authorName}</a> : <p className="truncate text-xs font-semibold text-[#292720]">{review.authorName}</p>}<div className="mt-1 flex flex-wrap items-center gap-2"><StarRating rating={review.rating} size={10} />{published ? <span className="text-[9px] text-[#827563]">{published}</span> : null}</div></div></div>
        </article>
      </div>
      {count > 1 ? <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
        <div className="flex items-center">{reviews.map((item, itemIndex) => <button key={item.id} type="button" aria-label={`Show review ${itemIndex + 1}`} aria-current={itemIndex === activeIndex ? "true" : undefined} onClick={() => navigate(itemIndex)} className="flex min-h-11 min-w-7 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[#91704a]"><span className={`h-1.5 rounded-full ${itemIndex === activeIndex ? "w-5 bg-[#91704a]" : "w-1.5 bg-[#d6c7b1]"}`} /></button>)}</div>
        <div className="flex items-center text-[#746e63]">
          <button type="button" aria-label="Previous review" className="flex size-11 items-center justify-center rounded-full hover:bg-[#e8e2d8]" onClick={() => navigate(activeIndex - 1)}><ChevronLeft aria-hidden size={18} /></button>
          {!reducedMotion ? <button type="button" aria-label={paused ? "Play reviews" : "Pause reviews"} className="flex size-11 items-center justify-center rounded-full hover:bg-[#e8e2d8]" onClick={() => setPaused((current) => !current)}>{paused ? <Play aria-hidden size={14} /> : <Pause aria-hidden size={14} />}</button> : null}
          <button type="button" aria-label="Next review" className="flex size-11 items-center justify-center rounded-full hover:bg-[#e8e2d8]" onClick={() => navigate(activeIndex + 1)}><ChevronRight aria-hidden size={18} /></button>
        </div>
      </div> : null}
    </div>
  );
}
