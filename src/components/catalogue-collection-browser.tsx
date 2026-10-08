"use client";

import { ArrowUpRight, Grid2X2, Images, Search } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import { getCatalogueDisplayTitle, getCatalogueImageAlt, getCatalogueImagePublicPath, getCataloguePublicPath } from "@/lib/catalogue";
import type { PublicCatalogueGroup } from "@/lib/public-content";
import { cn } from "@/lib/utils";

export function CatalogueCollectionBrowser({ groups, city, businessName }: { groups: PublicCatalogueGroup[]; city: string; businessName: string }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"collections" | "photos">("collections");
  const filtered = useMemo(() => groups.filter((group) => `${getCatalogueDisplayTitle(group)} ${group.description || ""} ${group.images.map((image) => image.subtitle || "").join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())), [groups, query]);

  return <section className="pb-8" aria-label="Browse ceiling designs">
    <div className="relative mt-6"><Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#91704a]" size={17} strokeWidth={1.5} /><input type="search" aria-label="Search catalogue collections" placeholder="Find a design or finish…" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-12 w-full rounded-full border border-[#ded5c8] bg-[#f5f1e9] pl-11 pr-4 text-sm text-[#292720] outline-none placeholder:text-[#aa9d89] focus:border-[#91704a]" /></div>
    <div className="mt-4 flex items-center justify-between gap-3">
      <div className="inline-flex rounded-full bg-[#eee9df] p-1" role="group" aria-label="Gallery view">{(["collections", "photos"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition", mode === value ? "bg-[#fbfbfa] text-[#292720] shadow-sm" : "text-[#827563] hover:text-[#292720]")}>{value === "collections" ? <Grid2X2 aria-hidden size={13} /> : <Images aria-hidden size={13} />}{value === "collections" ? "Collections" : "All photos"}</button>)}</div>
      <p aria-live="polite" className="text-[10px] text-[#827563]">{filtered.length} {filtered.length === 1 ? "collection" : "collections"}</p>
    </div>
    {filtered.length ? mode === "collections" ? <div className="mt-6 space-y-7">{filtered.map((item, index) => <PublicCatalogueCard key={item.id} item={item} city={city} businessName={businessName} lcpImage={index === 0} delayMs={6000 + (index % 5) * 450} />)}</div> : <div className="mt-6 columns-2 gap-3">{filtered.flatMap((group) => {
      const title = getCatalogueDisplayTitle(group);
      const photos = group.images.length ? group.images : group.previewImageUrl ? [{ id: "", imageUrl: group.previewImageUrl, subtitle: null, width: null, height: null }] : [];
      return photos.map((photo) => <figure key={`${group.id}-${photo.id}`} className="mb-4 break-inside-avoid"><Link href={photo.id ? getCatalogueImagePublicPath(group.id, photo.id) : getCataloguePublicPath(group.id)} className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]"><Image alt={getCatalogueImageAlt(photo, title, { city, businessName })} src={photo.imageUrl} width={photo.width || 600} height={photo.height || 800} sizes="(max-width: 560px) calc((100vw - 44px) / 2), 242px" className="h-auto w-full rounded-lg bg-[#e8e2d8]" unoptimized={shouldBypassImageOptimization(photo.imageUrl)} /><figcaption className="mt-2 flex items-start justify-between gap-2"><span className="line-clamp-2 text-[11px] font-medium leading-5 text-[#514c43]">{getCatalogueImageAlt(photo, title)}</span><ArrowUpRight aria-hidden className="mt-1 shrink-0 text-[#91704a]" size={12} /></figcaption></Link></figure>);
    })}</div> : <div className="py-12 text-center"><Images aria-hidden className="mx-auto text-[#b9a487]" size={30} strokeWidth={1.2} /><p className="mt-3 text-sm text-[#746e63]">{groups.length ? "No matching designs. Try another search." : "New designs are coming soon."}</p>{query ? <button type="button" onClick={() => setQuery("")} className="mt-3 min-h-11 text-xs font-medium text-[#91704a] underline underline-offset-4">Clear search</button> : null}</div>}
  </section>;
}
