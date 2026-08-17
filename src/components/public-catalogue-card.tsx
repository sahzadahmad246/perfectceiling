import Image from "next/image";
import Link from "next/link";

import { ViewCount } from "@/components/view-count";
import {
  getCatalogueDisplayTitle,
  getCatalogueImageAlt,
  getCataloguePublicPath,
} from "@/lib/catalogue";
import type { PublicCatalogueGroup } from "@/lib/public-content";
import { getCatalogueGroupViewCount } from "@/lib/views";

type PublicCatalogueCardProps = {
  item: PublicCatalogueGroup;
  city?: string | null;
  businessName?: string | null;
};

export function PublicCatalogueCard({
  item,
  city,
  businessName,
}: PublicCatalogueCardProps) {
  const title = getCatalogueDisplayTitle(item);
  const cover =
    item.images.find((image) => image.isThumbnail) ?? item.images[0];
  const alt = getCatalogueImageAlt(
    { subtitle: cover?.subtitle },
    title,
    { city, businessName },
  );
  const href = getCataloguePublicPath(item.id);
  const imageCount = item.images.length;
  const viewCount = getCatalogueGroupViewCount(item);

  return (
    <figure className="overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition hover:border-border-strong">
      <Link className="block" href={href}>
        <div className="relative aspect-[4/3] bg-surface-muted">
          <Image
            alt={alt}
            className="object-cover"
            fill
            loading="eager"
            priority
            sizes="(max-width: 560px) 100vw, 560px"
            src={item.previewImageUrl}
            unoptimized={item.previewImageUrl.startsWith("http")}
          />
          <ViewCount
            className="absolute right-3 top-3"
            count={viewCount}
            variant="on-image"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent px-3 pb-3 pt-10">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
              {title}
            </p>
            {imageCount > 1 ? (
              <p className="mt-1 text-xs text-white/80">
                {imageCount} photos
              </p>
            ) : null}
          </figcaption>
        </div>
      </Link>
    </figure>
  );
}
