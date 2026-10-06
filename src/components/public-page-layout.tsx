import { ArrowLeft, ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { toTelLink, type PublicBusinessSettings } from "@/lib/business-settings";

export function PublicPageLayout({ settings, whatsappHref, children }: {
  settings: PublicBusinessSettings;
  whatsappHref: string;
  children: ReactNode;
}) {
  return <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 text-[#292720] sm:px-8">
    <SiteHeader className="border-b-0 bg-[#f3f0e9]" />
    {children}
    <footer className="-mx-4 mt-10 bg-[#f3f0e9] px-4 py-7 sm:-mx-8 sm:px-8">
      <Link href="/" className="font-primary text-lg font-medium tracking-tight">{settings.businessName}</Link>
      <p className="mt-1 text-xs text-[#827563]">Ceilings & interiors · {settings.city}</p>
      <nav aria-label="Footer" className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#746e63]">
        <Link href="/services" className="hover:text-[#292720]">Services</Link>
        <Link href="/catalogue" className="hover:text-[#292720]">Catalogue</Link>
        <Link href="/projects" className="hover:text-[#292720]">Projects</Link>
        <Link href="/blog" className="hover:text-[#292720]">Articles</Link>
      </nav>
    </footer>
    <WhatsAppFab href={whatsappHref} />
  </main>;
}

export function PublicPageHeading({ href = "/", backLabel = "Home", eyebrow, title, children, share }: {
  href?: string; backLabel?: string; eyebrow: string; title: string; children?: ReactNode; share?: ReactNode;
}) {
  return <header className="-mx-4 bg-[#f3f0e9] px-4 pb-7 pt-4 sm:-mx-8 sm:px-8">
    <nav aria-label="Breadcrumb"><Link href={href} className="inline-flex min-h-10 items-center gap-2 text-xs text-[#827563] hover:text-[#292720]"><ArrowLeft aria-hidden size={14} />{backLabel}</Link></nav>
    <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">{eyebrow}</p>
    <div className="mt-3 flex items-start justify-between gap-3"><h1 className="min-w-0 font-primary text-[34px] font-medium leading-[1.12] tracking-[-0.04em]">{title}</h1>{share ? <div className="shrink-0">{share}</div> : null}</div>
    {children}
  </header>;
}

export function PublicInquiry({ settings, whatsappHref, title = "Let’s plan your space.", description = "Send us your room photos and measurements for a quotation." }: {
  settings: PublicBusinessSettings; whatsappHref: string; title?: string; description?: string;
}) {
  return <section className="mt-10 rounded-xl bg-[#eee7db] p-5 sm:p-6">
    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">Your next step</p>
    <h2 className="mt-3 font-primary text-[25px] font-medium leading-tight tracking-[-0.03em]">{title}</h2>
    <p className="mt-3 text-xs leading-6 text-[#746e63]">{description}</p>
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#292720] px-4 text-xs font-medium text-white transition hover:bg-[#4a463d]"><MessageCircle aria-hidden size={15} />Discuss your space<ArrowUpRight aria-hidden size={14} /></a>
      <a href={toTelLink(settings.phone)} className="inline-flex min-h-11 items-center gap-2 px-2 text-xs font-medium text-[#746e63]"><Phone aria-hidden size={14} />Call us</a>
    </div>
  </section>;
}
