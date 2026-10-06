import { ArrowUpRight, Images } from "lucide-react";
import Link from "next/link";

import { CatalogueAlbumMosaic } from "@/components/catalogue-album-mosaic";
import { getCatalogueDisplayTitle, getCatalogueImageAlt, getCataloguePublicPath } from "@/lib/catalogue";
import type { CatalogueMosaicPhoto } from "@/lib/catalogue-mosaic";
import type { PublicCatalogueGroup } from "@/lib/public-content";

type PublicCatalogueCardProps = { item: PublicCatalogueGroup; city?: string | null; businessName?: string | null; delayMs?: number; lcpImage?: boolean };

export function PublicCatalogueCard({ item, city, businessName, delayMs, lcpImage }: PublicCatalogueCardProps) {
  const title = getCatalogueDisplayTitle(item);
  const href = getCataloguePublicPath(item.id);
  const ordered = [...item.images].sort((a, b) => Number(b.isThumbnail) - Number(a.isThumbnail));
  const seen = new Set<string>();
  const photos: CatalogueMosaicPhoto[] = [];
  for (const image of ordered) {
    const url = image.imageUrl.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    photos.push({ id: image.id, url, alt: getCatalogueImageAlt(image, title, { city, businessName }) });
  }
  if (!photos.length && item.previewImageUrl) photos.push({ id: item.id, url: item.previewImageUrl, alt: title });
  if (!photos.length) return null;

  return <figure>
    <CatalogueAlbumMosaic photos={photos} href={href} title={title} delayMs={delayMs} lcpImage={lcpImage} />
    <figcaption><Link href={href} className="mt-3 flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]">
      <h3 className="min-w-0 flex-1 truncate font-primary text-base font-medium leading-snug text-[#292720]">{title}</h3>
      <span aria-label={`${photos.length} photos`} className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eee9df] px-2.5 py-1 text-[10px] font-medium text-[#746e63]"><Images aria-hidden size={11} />{photos.length}</span>
      <ArrowUpRight aria-hidden className="shrink-0 text-[#91704a]" size={18} />
    </Link></figcaption>
  </figure>;
}
