import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PublicPageLayout, PublicPageHeading, PublicInquiry } from "@/components/public-page-layout";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { getPublishedLocalities } from "@/lib/locality-data";
import { localityPath } from "@/lib/localities";
import { getPublicServices, getAllPublicProjects } from "@/lib/public-content";
import { buildPublicPageMetadata, buildBreadcrumbListNode, buildLocalBusinessNode, NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
type Props = { params: Promise<{ segments: string[] }> };
async function resolve(params: Props["params"]) {
  const { segments } = await params;
  return (await getPublishedLocalities()).find(page => localityPath(page) === `/areas/${segments.join("/")}`);
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [page, settings] = await Promise.all([resolve(params), getPublicBusinessSettings()]);
  if (!page) return { title: "Area not found", robots: NON_INDEXABLE_ROBOTS };
  return buildPublicPageMetadata({ title: page.seo_title || `Ceiling & interior services in ${page.name}`, description: page.seo_description || page.intro, url: `${siteConfig.url}${localityPath(page)}`, settings });
}
export default async function Page({ params }: Props) {
  const [page, settings, services, projects, areas] = await Promise.all([resolve(params), getPublicBusinessSettings(), getPublicServices(), getAllPublicProjects(), getPublishedLocalities()]);
  if (!page) notFound();
  const url = `${siteConfig.url}${localityPath(page)}`;
  const cityPage = areas.find(a => a.city_slug === page.city_slug && !a.slug);
  const siblings = areas.filter(a => a.city_slug === page.city_slug && a.id !== page.id);
  const selectedServices = services.filter(s => page.service_ids.includes(s.id));
  return <PublicPageLayout settings={settings} whatsappHref={toWhatsAppLink(settings.whatsapp, `I'd like a quotation in ${page.name}, ${page.city}.`)}><JsonLd data={[buildLocalBusinessNode(settings), buildBreadcrumbListNode(url, [{ name: "Home", item: siteConfig.url }, { name: "Service areas", item: `${siteConfig.url}/areas` }, ...(page.slug && cityPage ? [{ name: page.city, item: `${siteConfig.url}${localityPath(cityPage)}` }] : []), { name: page.name, item: url }]), { "@type": "WebPage", "@id": `${url}#page`, url, name: page.name, description: page.intro, dateModified: page.updated_at, about: selectedServices.map(s => ({ "@type": "Service", name: s.title, url: `${siteConfig.url}/services/${s.slug}`, areaServed: { "@type": "Place", name: `${page.name}, ${page.city}` }, provider: { "@id": `${siteConfig.url}/#business` } })) }]} /><PublicPageHeading href="/areas" backLabel="Service areas" eyebrow={page.city} title={`Ceilings & interiors in ${page.name}`}><p className="mt-4 text-sm leading-7 text-[#746e63]">{page.intro}</p></PublicPageHeading>
    <section className="py-7"><h2 className="font-primary text-2xl">For your space</h2>{page.content.split(/\n\s*\n/).map((p, i) => <p key={i} className="mt-4 whitespace-pre-line text-sm leading-7 text-[#746e63]">{p}</p>)}</section><section className="rounded-xl bg-[#eee7db] p-5"><h2 className="font-primary text-xl">Local details</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#746e63]">{page.local_details}</p></section>
    <section className="mt-8"><h2 className="font-primary text-2xl">Services available here</h2><div className="mt-3 divide-y divide-[#e4ded3]">{selectedServices.map(s => <Link key={s.id} href={`/services/${s.slug}`} className="flex justify-between py-4 text-sm">{s.title}<span aria-hidden>↗</span></Link>)}</div></section>
    {projects.some(p => page.project_ids.includes(p.id)) ? <section className="mt-8"><h2 className="font-primary text-2xl">Related work</h2>{projects.filter(p => page.project_ids.includes(p.id)).map(p => <Link key={p.id} href={`/projects/${p.slug}`} className="mt-4 block text-sm">{p.title}<span className="mt-1 block text-xs text-[#827563]">{p.location}</span></Link>)}</section> : null}
    {page.faqs.length ? <section className="mt-8"><h2 className="font-primary text-2xl">Your questions</h2>{page.faqs.map((faq, i) => <details key={i} className="border-b border-[#e4ded3] py-4"><summary className="cursor-pointer text-sm font-medium">{faq.question}</summary><p className="mt-3 text-sm leading-7 text-[#746e63]">{faq.answer}</p></details>)}</section> : null}
    {siblings.length ? <nav aria-label="Nearby service areas" className="mt-8 flex flex-wrap gap-3">{siblings.map(a => <Link key={a.id} href={localityPath(a)} className="rounded-full bg-[#eee7db] px-4 py-2 text-xs">{a.name}</Link>)}</nav> : null}<PublicInquiry settings={settings} whatsappHref={toWhatsAppLink(settings.whatsapp, `I'd like a quotation in ${page.name}.`)} /></PublicPageLayout>;
}
