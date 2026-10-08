import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { toTelLink, type PublicBusinessSettings } from "@/lib/business-settings";

export function HomeFooter({ settings, showAdminLogin, hasReviews }: { settings: PublicBusinessSettings; showAdminLogin: boolean; hasReviews: boolean }) {
  const links = [
    ["Services", "/services"], ["Catalogue", "/catalogue"],
    ["Our projects", "/projects"], ["Journal", "/blog"], ["Service areas", "/areas"], ["About", "/about"], ["Contact", "/contact"],
    ["Contact", "/#contact"], ...(hasReviews ? [["Client reviews", "/#reviews"]] : []),
  ];
  return (
    <footer className="-mx-4 border-t border-[#ded5c8] bg-[#f3f0e9] px-4 pb-8 pt-8 text-[#292720] sm:-mx-8 sm:px-8">
      <BrandLogo businessName={settings.businessName} logoUrl={settings.logoUrl} showName className="[&_span]:text-base" />
      <p className="mt-4 max-w-xs text-xs leading-6 text-[#6c665c]">Ceilings, thoughtful details, and a finish that feels like home.</p>
      <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-7">
        <nav aria-label="Footer"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#80603e]">Explore</p><ul className="mt-2">{links.map(([label, href]) => <li key={href}><Link href={href} className="inline-flex min-h-10 items-center gap-1.5 text-xs text-[#514c43] hover:text-[#80603e]">{label}<ArrowUpRight aria-hidden className="text-[#aa9d89]" size={12} /></Link></li>)}</ul></nav>
        <div><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#80603e]">Get in touch</p><div className="mt-4 space-y-4 text-xs leading-5 text-[#514c43]">
          {settings.phone ? <a href={toTelLink(settings.phone)} className="flex items-start gap-2 break-words hover:text-[#80603e]"><Phone aria-hidden className="mt-0.5 shrink-0 text-[#80603e]" size={13} /><span>{settings.phone}</span></a> : null}
          {settings.email ? <a href={`mailto:${settings.email}`} className="flex items-start gap-2 hover:text-[#80603e]"><Mail aria-hidden className="mt-0.5 shrink-0 text-[#80603e]" size={13} /><span className="break-all">{settings.email}</span></a> : null}
          <p className="flex items-start gap-2"><MapPin aria-hidden className="mt-0.5 shrink-0 text-[#80603e]" size={13} /><span className="whitespace-pre-line">{settings.serviceAreas || settings.city}</span></p>
        </div></div>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#ded5c8] pt-5 pr-16 text-[10px] text-[#6c665c]"><span>© {new Date().getFullYear()} {settings.businessName}</span>{showAdminLogin ? <Link href="/login" className="inline-flex min-h-9 items-center gap-1 hover:text-[#292720]">Admin login <ArrowUpRight aria-hidden size={11} /></Link> : null}</div>
    </footer>
  );
}
