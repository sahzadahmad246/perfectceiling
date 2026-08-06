import Image from "next/image";
import Link from "next/link";

import {
  getCatalogueAltText,
  getCatalogueDisplayTitle,
  getCataloguePublicPath,
} from "@/lib/catalogue";
import type { PublicCatalogueImage } from "@/lib/public-content";

type PublicCatalogueCardProps = {
  item: PublicCatalogueImage;
};

export function PublicCatalogueCard({ item }: PublicCatalogueCardProps) {
  const title = getCatalogueDisplayTitle(item);
  const alt = getCatalogueAltText(item);
  const href = getCataloguePublicPath(item.id);

  return (
    <figure className="overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition hover:border-border-strong">
      <Link className="block" href={href}>
        <div className="relative aspect-[4/3] bg-surface-muted">
          <Image
            alt={alt}
            className="object-cover"
            fill
            sizes="(max-width: 560px) 100vw, 560px"
            src={item.imageUrl}
            title={title}
            unoptimized={item.imageUrl.startsWith("http")}
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent px-3 pb-3 pt-10">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
              {item.caption}
            </p>
            {item.seoDescription ? (
              <span className="sr-only">{item.seoDescription}</span>
            ) : null}
          </figcaption>
        </div>
      </Link>
    </figure>
  );
}
