import { ArrowUpRight, LampCeiling, Layers, PanelsTopLeft, Waves } from "lucide-react";
import Link from "next/link";

import type { PublicService } from "@/lib/public-content";
import { getServicePublicPath } from "@/lib/services";

const styles = [
  { icon: LampCeiling, background: "bg-[#f1ede5]", color: "text-[#7b5b38]" },
  { icon: PanelsTopLeft, background: "bg-[#edf1ec]", color: "text-[#52674f]" },
  { icon: Layers, background: "bg-[#f3ebe6]", color: "text-[#805946]" },
  { icon: Waves, background: "bg-[#eeedf2]", color: "text-[#665770]" },
] as const;

export function CeilingDesignGuide({ services, whatsappHref }: { services: PublicService[]; whatsappHref: string }) {
  const choices = services.filter((service) => !service.id.startsWith("fallback-") && service.slug.trim()).slice(0, 4);
  if (!choices.length) return null;

  return (
    <section aria-labelledby="ceiling-guide-heading" className="px-4 py-9 sm:px-8">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#80603e]">A little inspiration</p>
      <h2 id="ceiling-guide-heading" className="mt-2 font-primary text-[26px] font-medium leading-tight tracking-[-0.035em] text-[#292720]">Find your interior style.</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {choices.map((service, index) => {
          const { icon: Icon, background, color } = styles[index % styles.length];
          return (
            <Link
              key={service.id}
              href={getServicePublicPath(service.slug)}
              className={`group flex flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a] motion-reduce:transform-none ${background} rounded-2xl`}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon aria-hidden className={color} size={24} strokeWidth={1.4} />
                <ArrowUpRight aria-hidden className="text-[#292720]/40 transition group-hover:text-[#292720]" size={15} />
              </div>
              <h3 className="mt-5 text-sm font-semibold leading-5 text-[#292720]">{service.title}</h3>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#6c665c]">{service.shortDescription}</p>
              <span className={`mt-auto pt-4 text-[10px] font-medium uppercase tracking-[0.12em] ${color}`}>Explore service</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 border-b border-[#e5e0d7] pb-6">
        <p className="text-xs leading-5 text-muted">Not sure where to start?</p>
        <a className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-medium text-[#292720] underline decoration-[#c9b69a] underline-offset-4 hover:decoration-[#292720]" href={whatsappHref} target="_blank" rel="noopener noreferrer">Let’s talk <ArrowUpRight aria-hidden size={14} /></a>
      </div>
    </section>
  );
}
