import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import {
  buildCatalogueListJsonLd,
  getCatalogueListUrl,
} from "@/lib/catalogue-seo";
import { getAllPublicCatalogueImages } from "@/lib/public-content";

export async function PublicCataloguePage() {
  const [settings, images] = await Promise.all([
    getPublicBusinessSettings(),
    getAllPublicCatalogueImages(),
  ]);

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    "Hi Perfect Ceiling, I saw your design catalogue and want a quotation.",
  );
  const telHref = toTelLink(settings.phone);
  const listDescription = `Browse ceiling design ideas from ${settings.businessName} in ${settings.city}. Pick a style and request a measured quote.`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildCatalogueListJsonLd(images, settings)} />

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
        <p className="text-sm text-muted">Design ideas</p>
        <h1 className="mt-2 font-primary text-3xl font-medium">
          Ceiling catalogue
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">{listDescription}</p>
        <div className="mt-5">
          <ShareButton
            text={listDescription}
            title={`Ceiling catalogue — ${settings.businessName}`}
            url={getCatalogueListUrl()}
          />
        </div>
      </section>

      {images.length > 0 ? (
        <section aria-label="Catalogue images" className="mt-8 space-y-4">
          {images.map((item) => (
            <PublicCatalogueCard item={item} key={item.id} />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-border-soft bg-surface-muted/70 p-5 text-center">
          <p className="text-sm font-medium text-foreground">
            Catalogue coming soon
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Published design photos from admin will appear here.
          </p>
        </section>
      )}

      <section className="mt-10 rounded-2xl bg-surface-muted/80 px-4 py-5">
        <p className="text-sm text-muted">Like a design?</p>
        <h2 className="mt-2 text-2xl font-medium">
          Share the style you want and we will quote it clearly.
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary-hover"
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium text-foreground transition duration-200 hover:border-primary"
            href={telHref}
          >
            <Phone size={17} />
            Call now
          </a>
          <Link
            className="minimal-link inline-flex items-center gap-1 text-sm"
            href="/services"
          >
            View services
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
