import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { PublicCatalogueDetailMedia } from "@/components/public-catalogue-detail-media";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import { ViewCount } from "@/components/view-count";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { getCatalogueDisplayTitle } from "@/lib/catalogue";
import {
  buildCatalogueDetailJsonLd,
  getCataloguePageUrl,
} from "@/lib/catalogue-seo";
import { getPublicCatalogueGroupById } from "@/lib/public-content";
import { getCatalogueGroupViewCount } from "@/lib/views";

type PublicCatalogueDetailPageProps = {
  id: string;
  imageId?: string | null;
};

export async function PublicCatalogueDetailPage({
  id,
  imageId,
}: PublicCatalogueDetailPageProps) {
  const [item, settings] = await Promise.all([
    getPublicCatalogueGroupById(id),
    getPublicBusinessSettings(),
  ]);

  if (!item) {
    notFound();
  }

  const title = getCatalogueDisplayTitle(item);
  const pageUrl = getCataloguePageUrl(item.id);
  const viewCount = getCatalogueGroupViewCount(item);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildCatalogueDetailJsonLd(item, settings)} />

      <SiteHeader />

      <nav aria-label="Breadcrumb" className="mt-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="minimal-link" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link className="minimal-link" href="/catalogue">
              Catalogue
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="line-clamp-1 text-foreground">{title}</li>
        </ol>
      </nav>

      <article>
        <header className="mt-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-primary text-3xl font-medium">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ViewCount count={viewCount} variant="chip" />
              <span className="text-xs text-muted">
                {item.images.length}{" "}
                {item.images.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          </div>
          <ShareButton
            className="shrink-0"
            label="Share all"
            text={`${title} — designs from ${settings.businessName}`}
            title={title}
            url={pageUrl}
            variant="icon"
          />
        </header>

        <p className="sr-only">
          {item.description?.trim() ||
            `${title} ceiling design photos from ${settings.businessName} in ${settings.city}.`}
        </p>

        <PublicCatalogueDetailMedia
          businessName={settings.businessName}
          city={settings.city}
          groupId={item.id}
          groupTitle={title}
          images={item.images}
          initialImageId={imageId}
          key={imageId ?? "gallery"}
        />
      </article>
    </main>
  );
}
