import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { ServiceImageCarousel } from "@/components/service-image-carousel";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import { getPublicServiceBySlug } from "@/lib/public-content";
import {
  formatServiceRate,
  getServiceGalleryImages,
  getServicePublicPath,
  prepareServicePageContent,
} from "@/lib/services";
import { buildServiceDetailJsonLd, getServicePageUrl } from "@/lib/service-seo";

type PublicServiceDetailPageProps = {
  slug: string;
};

export async function PublicServiceDetailPage({
  slug,
}: PublicServiceDetailPageProps) {
  const [service, settings] = await Promise.all([
    getPublicServiceBySlug(slug),
    getPublicBusinessSettings(),
  ]);

  if (!service) {
    notFound();
  }

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    `Hi Perfect Ceiling, I want a quotation for ${service.title}.`,
  );
  const telHref = toTelLink(settings.phone);
  const galleryImages = getServiceGalleryImages(
    service.featuredImageUrl,
    service.content,
  );
  const contentHtml = prepareServicePageContent(service.content, {
    title: service.title,
    shortDescription: service.shortDescription,
    seoTitle: service.seoTitle,
    seoDescription: service.seoDescription,
  });
  const hasContent = Boolean(contentHtml.trim());

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildServiceDetailJsonLd(service, settings)} />

      <SiteHeader />

      <div className="mt-4">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
          href="/services"
        >
          <ArrowLeft size={16} />
          All services
        </Link>
      </div>

      <article itemScope itemType="https://schema.org/Service">
        <meta content={service.title} itemProp="name" />
        <meta
          content={service.seoDescription?.trim() || service.shortDescription}
          itemProp="description"
        />
        <meta content={getServicePageUrl(service.slug)} itemProp="url" />

        <header className="mt-5">
          <p className="text-sm text-muted">{settings.city}</p>
          <h1 className="mt-2 font-primary text-3xl font-medium">{service.title}</h1>
        </header>

        <ServiceImageCarousel images={galleryImages} title={service.title} />

        <section className="mt-6">
          <p className="text-sm font-medium text-foreground">
            {formatServiceRate(service.startingPrice, service.rateUnit)}
          </p>
          <p className="mt-4 text-sm leading-7 text-foreground">
            {service.shortDescription}
          </p>
        </section>

        {hasContent ? (
          <section className="mt-8 border-t border-border-soft pt-8">
            <div
              className="article-editor-preview text-sm leading-7 text-foreground"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </section>
        ) : null}
      </article>

      <section className="mt-10 rounded-2xl bg-surface-muted/80 px-4 py-5">
        <p className="text-sm text-muted">Get a quote</p>
        <h2 className="mt-2 text-2xl font-medium">Ready to get started?</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Share room photos and measurements on WhatsApp. We will send a measured
          quotation for work in {settings.city}.
        </p>
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
        </div>
      </section>

      <footer className="mt-8 border-t border-border-soft pt-5 text-sm text-muted">
        <p>{getServicePublicPath(service.slug)}</p>
      </footer>
    </main>
  );
}