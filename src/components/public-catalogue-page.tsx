import { ArrowLeft, Images } from "lucide-react";
import Link from "next/link";

import { CatalogueCollectionBrowser } from "@/components/catalogue-collection-browser";
import { JsonLd } from "@/components/json-ld";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { buildCatalogueListJsonLd, getCatalogueListUrl } from "@/lib/catalogue-seo";
import { getAllPublicCatalogueGroups } from "@/lib/public-content";

export async function PublicCataloguePage() {
  const [settings, groups] = await Promise.all([getPublicBusinessSettings(), getAllPublicCatalogueGroups()]);
  const count = groups.reduce((total, group) => total + (group.images.length || (group.previewImageUrl ? 1 : 0)), 0);

  return <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 text-foreground sm:px-8">
    <JsonLd data={buildCatalogueListJsonLd(groups, settings)} />
    <SiteHeader className="border-b-0 bg-[#f3f0e9]" />
    <header className="-mx-4 bg-[#f3f0e9] px-4 pb-7 pt-5 sm:-mx-8 sm:px-8">
      <nav aria-label="Breadcrumb"><Link href="/" className="inline-flex min-h-9 items-center gap-2 text-xs text-[#827563] hover:text-[#292720]"><ArrowLeft aria-hidden size={14} />Home</Link></nav>
      <div className="mt-4 flex items-start justify-between gap-4"><div><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">The design library</p><h1 className="mt-3 font-primary text-[34px] font-medium leading-tight tracking-[-0.04em] text-[#292720]">Ceiling catalogue</h1></div><ShareButton className="mt-7 border-[#d8d0c3] bg-transparent" label="Share catalogue" text={`Ceiling designs — ${settings.businessName}`} title={`Ceiling catalogue — ${settings.businessName}`} url={getCatalogueListUrl()} variant="icon" /></div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-[#827563]"><span className="rounded-full bg-[#e8e1d5] px-3 py-1.5">{groups.length} collections</span><span className="inline-flex items-center gap-1.5"><Images aria-hidden size={12} />{count} design photos</span></div>
    </header>
    <CatalogueCollectionBrowser groups={groups} city={settings.city} businessName={settings.businessName} />
    <div className="-mx-4 border-t border-[#e5e0d7] bg-[#f3f0e9] px-4 py-6 sm:-mx-8 sm:px-8"><p className="font-primary text-sm font-medium text-[#292720]">{settings.businessName}</p><p className="mt-1 text-[11px] text-[#827563]">Ceilings & interiors · {settings.city}</p></div>
    <WhatsAppFab href={toWhatsAppLink(settings.whatsapp, "Hi, I would like help choosing a ceiling design from your catalogue.")} />
  </main>;
}
