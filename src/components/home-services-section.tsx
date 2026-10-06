import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { PublicService } from "@/lib/public-content";
import { PublicServicePreviewCard } from "@/components/public-service-preview-card";

export function HomeServicesSection({ services }: { services: PublicService[] }) {
  const available = services.filter((service) => !service.id.startsWith("fallback-") && service.slug.trim()).slice(0, 4);
  if (!available.length) return null;

  return (
    <section id="services" aria-labelledby="home-services-heading" className="bg-[#f3f0e9] px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">Our services</p>
          <h2 id="home-services-heading" className="mt-2 font-primary text-[26px] font-medium leading-tight tracking-[-0.035em] text-[#292720]">Details that make a home.</h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5">
        {available.map((service) => <PublicServicePreviewCard key={service.id} service={service} />)}
      </div>
      <Link href="/services" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ccc4b7] px-4 text-xs font-medium text-[#292720] transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4">View all services <ArrowUpRight aria-hidden size={15} /></Link>
    </section>
  );
}
