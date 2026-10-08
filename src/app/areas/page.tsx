import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedLocalities } from "@/lib/locality-data";
import { localityPath } from "@/lib/localities";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { buildPublicPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PublicPageLayout, PublicPageHeading, PublicInquiry } from "@/components/public-page-layout";
export async function generateMetadata(): Promise<Metadata> {
 const settings = await getPublicBusinessSettings();
 return buildPublicPageMetadata({ title: "Ceiling & interior service areas", description: `Explore ${settings.businessName}'s service coverage and local ceiling and interior services. Contact us to confirm availability for your address.`, url: `${siteConfig.url}/areas`, settings });
}
export default async function Page() {
 const [areas, settings] = await Promise.all([getPublishedLocalities(), getPublicBusinessSettings()]);
 const cities = [...new Set(areas.map(a => a.city_slug))];
 return <PublicPageLayout settings={settings} whatsappHref={toWhatsAppLink(settings.whatsapp)}><PublicPageHeading eyebrow="Where we work" title="Service areas"><p className="mt-4 text-sm leading-7 text-[#746e63]">Browse our coverage and local services. Share your address to confirm availability and discuss a quotation.</p></PublicPageHeading>{cities.map(city => <section key={city} className="py-6"><h2 className="font-primary text-2xl">{areas.find(a => a.city_slug === city)?.city}</h2><div className="mt-3 divide-y divide-[#e4ded3]">{areas.filter(a => a.city_slug === city).map(a => <Link key={a.id} href={localityPath(a)} className="flex justify-between py-4 text-sm">{a.name}<span aria-hidden>↗</span></Link>)}</div></section>)}{!areas.length ? <p className="py-6 text-sm leading-7 text-[#746e63]">For our current coverage in {settings.city}, contact us with your site address.</p> : null}<PublicInquiry settings={settings} whatsappHref={toWhatsAppLink(settings.whatsapp)} /></PublicPageLayout>;
}
