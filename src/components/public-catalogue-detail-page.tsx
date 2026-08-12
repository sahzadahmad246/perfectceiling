import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { PublicCatalogueDetailMedia } from "@/components/public-catalogue-detail-media";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { getCatalogueDisplayTitle } from "@/lib/catalogue";
import {
  buildCatalogueDetailJsonLd,
  getCataloguePageUrl,
} from "@/lib/catalogue-seo";
import { getPublicCatalogueGroupById } from "@/lib/public-content";

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
          <h1 className="font-primary text-3xl font-medium">{title}</h1>
          <ShareButton
            className="shrink-0"
            label="Share all"
            text={`${title} — designs from ${settings.businessName}`}
            title={title}
            url={pageUrl}
            variant="icon"
          />
        </header>

        <PublicCatalogueDetailMedia
          groupId={item.id}
          groupTitle={title}
          images={item.images}
          initialImageId={imageId}
        />
      </article>
    </main>
  );
}
