import { ArrowUpRight, Layers } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import Link from "next/link";

import type { PublicService } from "@/lib/public-content";
import { formatServiceRate, getServicePublicPath, resolveServiceCardImageUrl } from "@/lib/services";

export function PublicServicePreviewCard({ service, lcpImage = false }: { service: PublicService; lcpImage?: boolean }) {
  const image = service.featuredImageUrl?.trim() || service.imageUrl?.trim() || service.galleryImages[0]?.url || resolveServiceCardImageUrl(null, service.content);
  return <article className="h-full">
    <Link href={getServicePublicPath(service.slug)} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-[#fbfbfa] transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e2d8]">
        {image ? <Image alt={service.title} quality={55} fill loading={lcpImage ? "eager" : "lazy"} fetchPriority={lcpImage ? "high" : "auto"} src={image} sizes="(max-width: 560px) calc((100vw - 48px) / 2), 240px" className="object-cover transition duration-300 group-hover:scale-[1.025] motion-reduce:transform-none" unoptimized={shouldBypassImageOptimization(image)} /> : <div className="flex h-full items-center justify-center text-[#80603e]"><Layers aria-hidden size={30} strokeWidth={1.2} /></div>}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="font-primary text-sm font-semibold leading-5 text-[#292720]">{service.title}</h3>
        <p className="mt-2 text-[11px] leading-5 text-[#6c665c]">{formatServiceRate(service.startingPrice, service.rateUnit)}</p>
        <span className="mt-auto flex items-center justify-between gap-2 pt-4 text-[11px] font-medium text-[#80603e]">View details <ArrowUpRight aria-hidden size={15} /></span>
      </div>
    </Link>
  </article>;
}
