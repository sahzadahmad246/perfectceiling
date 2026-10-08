import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout, PublicPageHeading, PublicInquiry } from "@/components/public-page-layout";
import { getPublicBusinessSettings, toTelLink, toWhatsAppLink } from "@/lib/business-settings";
import { buildPublicPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
export async function generateMetadata(): Promise<Metadata> { const settings = await getPublicBusinessSettings(); return buildPublicPageMetadata({ title: `Contact ${settings.businessName} in ${settings.city}`, description: "Call or message us about ceiling and interior work. Share your location, room photos and measurements to discuss a quotation.", url: `${siteConfig.url}/contact`, settings }); }
export default async function Page() {
 const settings = await getPublicBusinessSettings(); const whatsapp = toWhatsAppLink(settings.whatsapp);
 return <PublicPageLayout settings={settings} whatsappHref={whatsapp}><PublicPageHeading eyebrow={settings.city} title="Let’s discuss your space."><p className="mt-4 text-sm leading-7 text-[#746e63]">Contact {settings.businessName} for ceiling and interior enquiries.</p></PublicPageHeading><div className="divide-y divide-[#e4ded3] py-5 text-sm"><a className="block py-4" href={toTelLink(settings.phone)}>Call: {settings.phone}</a><a className="block py-4" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp: {settings.whatsapp}</a>{settings.email ? <a className="block py-4" href={`mailto:${settings.email}`}>Email: {settings.email}</a> : null}<Link className="block py-4" href="/areas">Check service coverage ↗</Link></div><section className="mt-3"><h2 className="font-primary text-2xl">Helpful details to share</h2><p className="mt-3 text-sm leading-7 text-[#746e63]">Send your site location, the service you need, room photos and approximate measurements. We can discuss the work and what is needed for a quotation.</p></section><PublicInquiry settings={settings} whatsappHref={whatsapp} /></PublicPageLayout>;
}
