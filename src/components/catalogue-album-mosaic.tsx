"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { getCatalogueMosaicFrame, type CatalogueMosaicPhoto } from "@/lib/catalogue-mosaic";
import { cn } from "@/lib/utils";

function PhotoSlot({ photo, primary, delay, lcpImage = false, fullWidth = false }: { photo: CatalogueMosaicPhoto; primary: boolean; delay: number; lcpImage?: boolean; fullWidth?: boolean }) {
  const [displayed, setDisplayed] = useState(photo);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const replacing = displayed.url !== photo.url;
  const ready = readyUrl === photo.url;
  const sizes = fullWidth ? "(max-width: 559px) calc(100vw - 32px), (max-width: 639px) 528px, 496px" : primary
    ? "(max-width: 559px) calc((100vw - 36px) * 2 / 3), (max-width: 639px) 349px, 328px"
    : "(max-width: 559px) calc((100vw - 36px) / 3), (max-width: 639px) 175px, 164px";

  return <div className="relative h-full overflow-hidden bg-[#e8e2d8]">
    <Image src={displayed.url} alt={replacing ? "" : photo.alt} fill quality={65} sizes={sizes} loading={lcpImage ? "eager" : "lazy"} fetchPriority={lcpImage ? "high" : "auto"} className="object-cover" unoptimized={shouldBypassImageOptimization(displayed.url)} />
    {replacing ? <div
      aria-hidden={!ready}
      className={cn("absolute inset-0 transition-[opacity,transform] duration-[850ms] ease-out motion-reduce:transition-none", ready ? "scale-100 opacity-100" : "scale-[1.035] opacity-0")}
      style={{ transitionDelay: `${delay}ms` }}
      onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === "opacity" && ready) setDisplayed(photo); }}
    ><Image key={photo.url} src={photo.url} alt={photo.alt} fill quality={65} sizes={sizes} className="object-cover" onLoad={() => setReadyUrl(photo.url)} unoptimized={shouldBypassImageOptimization(photo.url)} /></div> : null}
  </div>;
}

export function CatalogueAlbumMosaic({ photos, href, title, delayMs = 6000, lcpImage = false }: { photos: CatalogueMosaicPhoto[]; href: string; title: string; delayMs?: number; lcpImage?: boolean }) {
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const current = getCatalogueMosaicFrame(photos, frame);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion(); updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); media.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", updateVisibility); };
  }, []);

  useEffect(() => {
    if (photos.length < 2 || paused || interacting || !visible || hidden || reducedMotion) return;
    const timer = setTimeout(() => setFrame((value) => (value + 1) % photos.length), delayMs);
    return () => clearTimeout(timer);
  }, [photos.length, frame, paused, interacting, visible, hidden, reducedMotion, delayMs]);

  if (!current.length) return null;
  return <div ref={ref} className="relative" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
    <Link href={href} aria-label={`Open ${title} collection`} className={cn("grid aspect-[16/9] gap-1 overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]", current.length > 1 ? "grid-cols-[2fr_1fr]" : "grid-cols-1")}>
      <PhotoSlot photo={current[0]} primary fullWidth={current.length === 1} delay={0} lcpImage={lcpImage} />
      {current.length > 1 ? <div className={cn("grid gap-1", current.length === 3 ? "grid-rows-2" : "grid-rows-1")}>{current.slice(1).map((photo, slot) => <PhotoSlot key={slot} photo={photo} primary={false} delay={(slot + 1) * 90} />)}</div> : null}
    </Link>
    {photos.length > 1 && !reducedMotion ? <button type="button" aria-label={paused ? `Play ${title} preview` : `Pause ${title} preview`} onClick={() => setPaused((value) => !value)} className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-white">{paused ? <Play aria-hidden size={12} /> : <Pause aria-hidden size={12} />}</button> : null}
  </div>;
}
