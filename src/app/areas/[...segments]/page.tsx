import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LocalityServicePicker } from "@/components/locality-service-picker";
import { PublicServicePreviewCard } from "@/components/public-service-preview-card";
import { PublicPageLayout, PublicPageHeading, PublicInquiry } from "@/components/public-page-layout";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { getPublishedLocalities } from "@/lib/locality-data";
import { getLocalityServices, localityInquiry, localityPath, selectLocalityService } from "@/lib/localities";
import { getPublicServices, getAllPublicProjects } from "@/lib/public-content";
import { formatServiceRate } from "@/lib/services";
import { buildPublicPageMetadata, buildBreadcrumbListNode, buildLocalBusinessNode, NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type Props = { params: Promise<{ segments: string[] }>; searchParams: Promise<{ service?: string | string[] }> };
async function resolve(params: Props["params"]) {
  const { segments } = await params;
  return (await getPublishedLocalities()).find(page => localityPath(page) === `/areas/${segments.join("/")}`);
}
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [page, settings, services, query] = await Promise.all([resolve(params), getPublicBusinessSettings(), getPublicServices(), searchParams]);
  if (!page) return { title: "Area not found", robots: NON_INDEXABLE_ROBOTS };
  const active = selectLocalityService(page, services, typeof query.service === "string" ? query.service : undefined);
  const canonical = `${siteConfig.url}${localityPath(page)}`;
  return buildPublicPageMetadata({ title: active ? `${active.title} in ${page.name}` : page.seo_title || `Ceiling & interior services in ${page.name}`, description: active ? `${active.shortDescription} Explore work details and request a quotation in ${page.name}.` : page.seo_description || page.intro, url: active ? `${canonical}?service=${encodeURIComponent(active.slug)}` : canonical, canonicalUrl: canonical, settings, images: active?.imageUrl ? [active.imageUrl] : undefined });
}
export default async function Page({ params, searchParams }: Props) {
  const [page, settings, services, projects, areas, query] = await Promise.all([resolve(params), getPublicBusinessSettings(), getPublicServices(), getAllPublicProjects(), getPublishedLocalities(), searchParams]);
  if (!page) notFound();
  const path = localityPath(page);
  const url = `${siteConfig.url}${path}`;
  const cityPage = areas.find(area => area.city_slug === page.city_slug && !area.slug);
  const siblings = areas.filter(area => area.city_slug === page.city_slug && area.id !== page.id);
  const selectedServices = getLocalityServices(page, services);
  const active = selectLocalityService(page, services, typeof query.service === "string" ? query.service : undefined);
  const whatsapp = toWhatsAppLink(settings.whatsapp, localityInquiry(page, active?.title));
  const title = active ? `${active.title} in ${page.name}` : `Ceilings & interiors in ${page.name}`;
  const related = projects.filter(project => page.project_ids.includes(project.id) && project.status === "completed");
  const serviceSummaries = selectedServices.map(({ id, title, slug }) => ({ id, title, slug }));
  return <PublicPageLayout settings={settings} whatsappHref={whatsapp}>
    <JsonLd data={[buildLocalBusinessNode(settings), buildBreadcrumbListNode(url, [{ name: "Home", item: siteConfig.url }, { name: "Service areas", item: `${siteConfig.url}/areas` }, ...(page.slug && cityPage ? [{ name: page.city, item: `${siteConfig.url}${localityPath(cityPage)}` }] : []), { name: page.name, item: url }]), { "@type": "WebPage", "@id": `${url}#page`, url, name: title, description: page.intro, dateModified: page.updated_at, about: selectedServices.map(service => ({ "@type": "Service", name: service.title, url: `${siteConfig.url}/services/${service.slug}`, areaServed: { "@type": "Place", name: page.slug ? `${page.name}, ${page.city}` : page.name }, provider: { "@id": `${siteConfig.url}/#business` } })) }]} />
    <PublicPageHeading href={page.slug && cityPage ? localityPath(cityPage) : "/areas"} backLabel={page.slug && cityPage ? page.city : "Service areas"} eyebrow={page.slug ? `${page.city} · Local services` : "City service coverage"} title={title}>
      <p className="mt-4 text-sm leading-7 text-[#6c665c]">{page.intro}</p>
      {selectedServices.length ? <LocalityServicePicker path={path} services={serviceSummaries} selectedSlug={active?.slug} /> : null}
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#292720] px-4 text-xs font-medium text-white">Get a quotation in {page.name}<span aria-hidden>↗</span></a>
    </PublicPageHeading>
    {active ? <section className="mt-7 rounded-xl bg-[#eee7db] p-5"><p className="text-[10px] uppercase tracking-[0.14em] text-[#80603e]">Your selected service</p><h2 className="mt-2 font-primary text-2xl tracking-tight">{active.title}</h2><p className="mt-3 text-sm leading-7 text-[#6c665c]">{active.shortDescription}</p>{active.startingPrice !== null ? <p className="mt-3 text-xs font-medium text-[#80603e]">{formatServiceRate(active.startingPrice, active.rateUnit)} · Final scope confirmed in your quotation</p> : null}<Link href={`/services/${active.slug}`} className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-medium text-[#80603e]">Full service details<span aria-hidden>↗</span></Link></section> : null}
    <section className="py-7"><p className="text-[10px] uppercase tracking-[0.14em] text-[#80603e]">Work & planning</p><h2 className="mt-2 font-primary text-2xl tracking-tight">For your space in {page.name}</h2>{page.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} className="mt-4 whitespace-pre-line text-sm leading-7 text-[#6c665c]">{paragraph}</p>)}</section>
    <section className="rounded-xl border border-[#e4ded3] p-5"><h2 className="font-primary text-xl tracking-tight">Local details</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#6c665c]">{page.local_details}</p></section>
    {selectedServices.length ? <section className="mt-8"><h2 className="font-primary text-2xl tracking-tight">Services in {page.name}</h2><div className="mt-4 grid grid-cols-2 gap-3">{selectedServices.map(service => <PublicServicePreviewCard key={service.id} service={service} />)}</div></section> : null}
    {related.length ? <section className="mt-8"><h2 className="font-primary text-2xl tracking-tight">Related completed work</h2><div className="mt-3 divide-y divide-[#e4ded3]">{related.map(project => <Link key={project.id} href={`/projects/${project.slug}`} className="flex items-center justify-between gap-3 py-4 text-sm"><span>{project.title}<span className="mt-1 block text-xs text-[#746653]">{project.location}</span></span><span aria-hidden className="text-[#80603e]">↗</span></Link>)}</div></section> : null}
    {page.faqs.length ? <section className="mt-8"><h2 className="font-primary text-2xl tracking-tight">Your questions</h2>{page.faqs.map((faq, index) => <details key={index} className="border-b border-[#e4ded3] py-4"><summary className="cursor-pointer text-sm font-medium">{faq.question}</summary><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#6c665c]">{faq.answer}</p></details>)}</section> : null}
    {siblings.length ? <section className="mt-8"><h2 className="font-primary text-xl tracking-tight">More areas in {page.city}</h2><nav aria-label="Other service areas" className="mt-4 flex flex-wrap gap-2">{siblings.map(area => <Link key={area.id} href={`${localityPath(area)}${active && area.service_ids.includes(active.id) ? `?service=${encodeURIComponent(active.slug)}` : ""}`} className="rounded-full bg-[#eee7db] px-4 py-2.5 text-xs text-[#6c665c]">{area.name}</Link>)}</nav></section> : null}
    <PublicInquiry settings={settings} whatsappHref={whatsapp} title={`Let’s plan your ${active ? active.title.toLowerCase() : "space"}.`} description={`Share your site address in ${page.name}, room photos and measurements to discuss a quotation.`} />
  </PublicPageLayout>;
}
