import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout, PublicPageHeading, PublicInquiry } from "@/components/public-page-layout";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { buildPublicPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
export async function generateMetadata(): Promise<Metadata> { const settings = await getPublicBusinessSettings(); return buildPublicPageMetadata({ title: `About ${settings.businessName}`, description: `Ceiling and interior services from ${settings.businessName} in ${settings.city}. Explore services, design inspiration and completed work, or contact us for a quotation.`, url: `${siteConfig.url}/about`, settings }); }
export default async function Page() {
 const settings = await getPublicBusinessSettings(); const whatsapp = toWhatsAppLink(settings.whatsapp);
 return <PublicPageLayout settings={settings} whatsappHref={whatsapp}><PublicPageHeading eyebrow={`Based in ${settings.city}`} title={settings.businessName}><p className="mt-4 text-sm leading-7 text-[#746e63]">Ceiling and interior services for your space.</p></PublicPageHeading><section className="py-7"><h2 className="font-primary text-2xl">From ideas to a quotation</h2><p className="mt-4 text-sm leading-7 text-[#746e63]">Browse our service details to understand the available finishes. Our catalogue offers design inspiration, while our project portfolio shows published work with its location and scope. Contact us to discuss your site and request a quotation.</p><nav className="mt-6 flex flex-wrap gap-4 text-sm text-[#91704a]"><Link href="/services">Our services ↗</Link><Link href="/projects">Project portfolio ↗</Link><Link href="/catalogue">Design catalogue ↗</Link><Link href="/contact">Contact us ↗</Link></nav></section><PublicInquiry settings={settings} whatsappHref={whatsapp} /></PublicPageLayout>;
}
