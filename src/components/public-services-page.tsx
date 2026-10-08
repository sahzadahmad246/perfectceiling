import { JsonLd } from "@/components/json-ld";
import { ServicesBrowser } from "@/components/public-content-browser";
import { PublicInquiry, PublicPageHeading, PublicPageLayout } from "@/components/public-page-layout";
import { ShareButton } from "@/components/share-button";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { getPublicServices } from "@/lib/public-content";
import { buildServicesListJsonLd, getServicesListUrl } from "@/lib/service-seo";

export async function PublicServicesPage() {
  const [settings, services] = await Promise.all([getPublicBusinessSettings(), getPublicServices()]);
  const whatsappHref = toWhatsAppLink(settings.whatsapp, "Hi, I would like a quotation for ceiling and interior work.");
  return <PublicPageLayout settings={settings} whatsappHref={whatsappHref}>
    <JsonLd data={buildServicesListJsonLd(services, settings)} />
    <PublicPageHeading eyebrow={`Ceiling & interior services · ${settings.city}`} title="Details that make a home." share={<ShareButton variant="icon" label="Share services" title={`Services — ${settings.businessName}`} text={`Ceiling and interior services in ${settings.city}`} url={getServicesListUrl()} className="border-[#d8d0c3] bg-transparent" />}>
      <p className="mt-4 max-w-[36ch] text-sm leading-6 text-[#746e63]">Ceilings, finishes and installation in {settings.city}. Find the right service for your space.</p>
    </PublicPageHeading>
    <ServicesBrowser services={services} />
    <PublicInquiry settings={settings} whatsappHref={whatsappHref} title="A space in mind?" />
  </PublicPageLayout>;
}
