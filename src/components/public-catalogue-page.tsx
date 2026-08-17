import { JsonLd } from "@/components/json-ld";
import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import {
  buildCatalogueListJsonLd,
  getCatalogueListUrl,
} from "@/lib/catalogue-seo";
import { getAllPublicCatalogueGroups } from "@/lib/public-content";
import Link from "next/link";

export async function PublicCataloguePage() {
  const [settings, groups] = await Promise.all([
    getPublicBusinessSettings(),
    getAllPublicCatalogueGroups(),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildCatalogueListJsonLd(groups, settings)} />

      <SiteHeader />

      <nav aria-label="Breadcrumb" className="mt-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="minimal-link" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">Catalogue</li>
        </ol>
      </nav>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-primary text-3xl font-medium">Portfolio</h1>
          <ShareButton
            label="Share"
            text={`Design portfolio — ${settings.businessName}`}
            title={`Portfolio — ${settings.businessName}`}
            url={getCatalogueListUrl()}
            variant="icon"
          />
        </div>
        <p className="sr-only">
          Ceiling design photos from {settings.businessName} in {settings.city}.
          Open a collection to browse every image.
        </p>
      </section>

      {groups.length > 0 ? (
        <section aria-label="Catalogue gallery" className="mt-6 space-y-4">
          {groups.map((item) => (
            <PublicCatalogueCard
              businessName={settings.businessName}
              city={settings.city}
              item={item}
              key={item.id}
            />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-border-soft bg-surface-muted/70 p-5 text-center">
          <p className="text-sm font-medium text-foreground">No images found</p>
        </section>
      )}
    </main>
  );
}
