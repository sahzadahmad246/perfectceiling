import type { Metadata } from "next";
import { AreaBrowser } from "@/components/area-browser";
import { getPublishedLocalities } from "@/lib/locality-data";
import { getPublicServices } from "@/lib/public-content";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { buildPublicPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PublicPageLayout, PublicPageHeading, PublicInquiry } from "@/components/public-page-layout";
export async function generateMetadata(): Promise<Metadata> {
 const settings = await getPublicBusinessSettings();
 return buildPublicPageMetadata({ title: "Ceiling & interior service areas", description: `Explore ${settings.businessName}'s service coverage and local ceiling and interior services. Contact us to confirm availability for your address.`, url: `${siteConfig.url}/areas`, settings });
}
export default async function Page() {
 const [areas, settings, services] = await Promise.all([getPublishedLocalities(), getPublicBusinessSettings(), getPublicServices()]);
 const areaServices = services.filter(service => areas.some(area => area.service_ids.includes(service.id))).map(({ id, title, slug }) => ({ id, title, slug }));
 const summaries = areas.map(({ id, name, city, city_slug, slug, intro, service_ids }) => ({ id, name, city, city_slug, slug, intro, service_ids: service_ids.filter(serviceId => areaServices.some(service => service.id === serviceId)) }));
 return <PublicPageLayout settings={settings} whatsappHref={toWhatsAppLink(settings.whatsapp)}><PublicPageHeading eyebrow="Where we work" title="Find us in your area."><p className="mt-4 text-sm leading-7 text-[#6c665c]">Choose your location and the work you have in mind. Explore local details, available services and related projects.</p></PublicPageHeading><AreaBrowser areas={summaries} services={areaServices} />{!areas.length ? <p className="py-6 text-sm leading-7 text-[#6c665c]">For our current coverage in {settings.city}, contact us with your site address.</p> : null}<PublicInquiry settings={settings} whatsappHref={toWhatsAppLink(settings.whatsapp)} /></PublicPageLayout>;
}
