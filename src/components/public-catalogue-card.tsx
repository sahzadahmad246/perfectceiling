import Image from "next/image";
import Link from "next/link";

import {
  getCatalogueDisplayTitle,
  getCatalogueImageAlt,
  getCataloguePublicPath,
} from "@/lib/catalogue";
import type { PublicCatalogueGroup } from "@/lib/public-content";

type PublicCatalogueCardProps = {
  item: PublicCatalogueGroup;
};

export function PublicCatalogueCard({ item }: PublicCatalogueCardProps) {
  const title = getCatalogueDisplayTitle(item);
  const cover =
    item.images.find((image) => image.isThumbnail) ?? item.images[0];
  const alt = getCatalogueImageAlt(
    { subtitle: cover?.subtitle },
    title,
  );
  const href = getCataloguePublicPath(item.id);
  const imageCount = item.images.length;

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
            title={title}
            unoptimized={item.previewImageUrl.startsWith("http")}
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
