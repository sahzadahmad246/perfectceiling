import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { PublicCatalogueDetailMedia } from "@/components/public-catalogue-detail-media";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import {
  getCatalogueAltText,
  getCatalogueDisplayTitle,
  getCatalogueSeoDescription,
} from "@/lib/catalogue";
import {
  buildCatalogueDetailJsonLd,
  getCataloguePageUrl,
} from "@/lib/catalogue-seo";
import { getPublicCatalogueImageById } from "@/lib/public-content";

type PublicCatalogueDetailPageProps = {
  id: string;
};

export async function PublicCatalogueDetailPage({
  id,
}: PublicCatalogueDetailPageProps) {
  const [item, settings] = await Promise.all([
    getPublicCatalogueImageById(id),
    getPublicBusinessSettings(),
  ]);

  if (!item) {
    notFound();
  }

  const title = getCatalogueDisplayTitle(item);
  const alt = getCatalogueAltText(item);
  const description = getCatalogueSeoDescription(item);
  const pageUrl = getCataloguePageUrl(item.id);
  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    `Hi Perfect Ceiling, I like this design: ${title}. Please send a quotation.`,
  );
  const telHref = toTelLink(settings.phone);

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

      <article itemScope itemType="https://schema.org/ImageObject">
        <meta content={title} itemProp="name" />
        <meta content={description} itemProp="description" />
        <meta content={pageUrl} itemProp="url" />
        {item.imageUrl ? (
          <meta content={item.imageUrl} itemProp="contentUrl" />
        ) : null}

        <header className="mt-5">
          <p className="text-sm text-muted">Design catalogue</p>
          <h1 className="mt-2 font-primary text-3xl font-medium">{title}</h1>
          {description && description !== title ? (
            <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
          ) : null}
        </header>

        <PublicCatalogueDetailMedia
          alt={alt}
          imageUrl={item.imageUrl}
          title={title}
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <ShareButton
            text={`${title} — ceiling design from ${settings.businessName}`}
            title={title}
            url={pageUrl}
          />
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
        </div>

        <section className="mt-10 rounded-2xl bg-surface-muted/80 px-4 py-5">
          <p className="text-sm text-muted">Want this look?</p>
          <h2 className="mt-2 text-2xl font-medium">
            We install designs like this in {settings.city}.
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Send this design link or a screenshot on WhatsApp with your room
            photos for a measured quotation from {settings.businessName}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
              href={whatsappHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle size={17} />
              Request quote
            </a>
            <a
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium transition hover:border-primary"
              href={telHref}
            >
              <Phone size={17} />
              Call
            </a>
            <Link
              className="inline-flex h-11 items-center gap-1 rounded-full border border-border-strong px-5 text-sm font-medium transition hover:border-primary"
              href="/catalogue"
            >
              <ArrowLeft size={15} />
              All designs
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
