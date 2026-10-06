import { ArrowUpRight, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PublicInquiry, PublicPageHeading, PublicPageLayout } from "@/components/public-page-layout";
import { PublicServicePreviewCard } from "@/components/public-service-preview-card";
import { RecordContentView } from "@/components/record-content-view";
import { ServiceImageCarousel } from "@/components/service-image-carousel";
import { ShareButton } from "@/components/share-button";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { getPublicServiceBySlug, getPublicServices } from "@/lib/public-content";
import { formatServiceRate, getServiceGalleryImages, prepareServicePageContent } from "@/lib/services";
import { buildServiceDetailJsonLd, getServicePageUrl } from "@/lib/service-seo";

export async function PublicServiceDetailPage({ slug }: { slug: string }) {
  const [service, settings, services] = await Promise.all([getPublicServiceBySlug(slug), getPublicBusinessSettings(), getPublicServices()]);
  if (!service) notFound();
  const whatsappHref = toWhatsAppLink(settings.whatsapp, `Hi, I would like a quotation for ${service.title}.`);
  const images = getServiceGalleryImages(service.featuredImageUrl, service.content);
  const contentHtml = prepareServicePageContent(service.content, { title: service.title, shortDescription: service.shortDescription, seoTitle: service.seoTitle, seoDescription: service.seoDescription });
  const related = services.filter((item) => item.id !== service.id && !item.id.startsWith("fallback-")).slice(0, 2);
  return <PublicPageLayout settings={settings} whatsappHref={whatsappHref}>
    <JsonLd data={buildServiceDetailJsonLd(service, settings)} />
    {!service.id.startsWith("fallback-") ? <RecordContentView id={service.id} kind="service" /> : null}
    <article itemScope itemType="https://schema.org/Service">
      <meta content={service.title} itemProp="name" /><meta content={service.seoDescription?.trim() || service.shortDescription} itemProp="description" /><meta content={getServicePageUrl(service.slug)} itemProp="url" />
      <PublicPageHeading href="/services" backLabel="All services" eyebrow="Ceilings & interior finishes" title={service.title} share={<ShareButton variant="icon" label="Share this service" title={`${service.title} — ${settings.businessName}`} text={service.shortDescription} url={getServicePageUrl(service.slug)} className="border-[#d8d0c3] bg-transparent" />}>
        <p className="mt-4 text-sm leading-7 text-[#746e63]">{service.shortDescription}</p>
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#827563]"><MapPin aria-hidden size={12} />Available in {settings.city}</p>
      </PublicPageHeading>
      <ServiceImageCarousel images={images} title={service.title} />
      <section aria-label="Pricing and quotation" className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-[#e1dbcf] py-5">
        <div><p className="text-[10px] uppercase tracking-[0.12em] text-[#91704a]">Service rate</p><p className="mt-2 font-primary text-lg font-medium">{formatServiceRate(service.startingPrice, service.rateUnit)}</p></div>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#292720] px-4 text-xs font-medium text-white"><MessageCircle aria-hidden size={14} />Get a quote</a>
      </section>
      {contentHtml.trim() ? <section className="mt-8"><p className="mb-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">About this service</p><div className="article-editor-preview public-reading-content" dangerouslySetInnerHTML={{ __html: contentHtml }} /></section> : null}
    </article>
    <PublicInquiry settings={settings} whatsappHref={whatsappHref} title={`Let’s plan your ${service.title.toLowerCase()}.`} description={`Share photos and measurements of your space in ${settings.city}. We’ll help you work out the details and quotation.`} />
    {related.length ? <section className="mt-10"><div className="flex items-center justify-between gap-3"><h2 className="font-primary text-xl font-medium tracking-tight">More for your space</h2><Link href="/services" className="inline-flex min-h-10 items-center gap-1 text-[11px] text-[#91704a]">All services<ArrowUpRight aria-hidden size={14} /></Link></div><div className="mt-4 grid grid-cols-2 gap-3">{related.map((item) => <PublicServicePreviewCard key={item.id} service={item} />)}</div></section> : null}
  </PublicPageLayout>;
}
