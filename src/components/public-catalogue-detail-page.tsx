import { ArrowLeft, Images } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

import { JsonLd } from "@/components/json-ld";
import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import { PublicCatalogueDetailMedia } from "@/components/public-catalogue-detail-media";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { getCatalogueDisplayTitle } from "@/lib/catalogue";
import { buildCatalogueDetailJsonLd, getCataloguePageUrl } from "@/lib/catalogue-seo";
import { getAllPublicCatalogueGroups, getPublicCatalogueGroupById } from "@/lib/public-content";

type PublicCatalogueDetailPageProps = { id: string; imageId?: string | null };

export async function PublicCatalogueDetailPage({ id, imageId }: PublicCatalogueDetailPageProps) {
  const [item, settings, groups] = await Promise.all([getPublicCatalogueGroupById(id), getPublicBusinessSettings(), getAllPublicCatalogueGroups()]);
  if (!item) notFound();
  const title = getCatalogueDisplayTitle(item);
  const related = groups.filter((group) => group.id !== id).slice(0, 2);
  const whatsappHref = toWhatsAppLink(settings.whatsapp, `Hi, I like the ${title} collection: ${getCataloguePageUrl(item.id)}. Can you help me plan a design for my space?`);
  const images = item.images.length ? item.images : item.previewImageUrl ? [{ id: `preview-${item.id}`, imageUrl: item.previewImageUrl, subtitle: null, isThumbnail: true, viewCount: 0 }] : [];

  return <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 text-foreground sm:px-8">
    <JsonLd data={buildCatalogueDetailJsonLd(item, settings)} />
    <SiteHeader className="border-b-0 bg-[#f3f0e9]" />
    <header className="-mx-4 bg-[#f3f0e9] px-4 pb-7 pt-5 sm:-mx-8 sm:px-8">
      <nav aria-label="Breadcrumb"><Link href="/catalogue" className="inline-flex min-h-9 items-center gap-2 text-xs text-[#827563] hover:text-[#292720]"><ArrowLeft aria-hidden size={14} />All collections</Link></nav>
      <div className="mt-4 flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">The design collection</p><h1 className="mt-3 font-primary text-[30px] font-medium leading-tight tracking-[-0.04em] text-[#292720]">{title}</h1></div><ShareButton className="mt-7 shrink-0 border-[#d8d0c3] bg-transparent" label="Share collection" text={`${title} — ${settings.businessName}`} title={title} url={getCataloguePageUrl(item.id)} variant="icon" /></div>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#e8e1d5] px-3 py-1.5 text-[10px] text-[#746e63]"><Images aria-hidden size={12} />{images.length} {images.length === 1 ? "photo" : "photos"}</span>
      {item.description?.trim() ? <p className="mt-4 text-xs leading-6 text-[#746e63]">{item.description.trim()}</p> : null}
    </header>
    <PublicCatalogueDetailMedia businessName={settings.businessName} city={settings.city} groupId={item.id} groupTitle={title} images={images} initialImageId={imageId} key={imageId ?? "gallery"} />
    <section className="-mx-4 bg-[#f3f0e9] px-4 py-7 sm:-mx-8 sm:px-8"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">Make it yours</p><h2 className="mt-2 font-primary text-xl font-medium tracking-[-0.025em] text-[#292720]">Found a design you love?</h2><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#292720] px-4 text-xs font-medium text-white transition hover:bg-[#4a4439]"><FaWhatsapp aria-hidden size={16} />Talk about this collection</a></section>
    {related.length ? <section className="py-8"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">Keep exploring</p><h2 className="mt-2 font-primary text-2xl font-medium tracking-[-0.035em] text-[#292720]">More design collections</h2><div className="mt-5 space-y-6">{related.map((group, index) => <PublicCatalogueCard key={group.id} item={group} city={settings.city} businessName={settings.businessName} delayMs={6500 + index * 450} />)}</div></section> : null}
    <div className="-mx-4 border-t border-[#e5e0d7] bg-[#f3f0e9] px-4 py-6 sm:-mx-8 sm:px-8"><Link href="/catalogue" className="inline-flex min-h-9 items-center gap-2 text-xs font-medium text-[#746e63]"><ArrowLeft aria-hidden size={13} />Back to the catalogue</Link></div>
    <WhatsAppFab href={whatsappHref} />
  </main>;
}
