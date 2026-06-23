import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PublicServiceCardMedia } from "@/components/public-service-card-media";
import { formatServiceRate, getServicePublicPath } from "@/lib/services";
import { getServiceSeoDescription } from "@/lib/service-seo";
import type { PublicService } from "@/lib/public-content";

type PublicServicePreviewCardProps = {
  service: PublicService;
};

export function PublicServicePreviewCard({
  service,
}: PublicServicePreviewCardProps) {
  const href = getServicePublicPath(service.slug);
  const rateLabel = formatServiceRate(service.startingPrice, service.rateUnit);
  const imageAlt = `${service.title} — ${getServiceSeoDescription(service)}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition duration-200 hover:border-border-strong">
      <Link className="block" href={href}>
        <PublicServiceCardMedia
          imageAlt={imageAlt}
          images={service.galleryImages}
          title={service.title}
        />

        <div className="p-4">
          <h3 className="font-primary text-xl font-semibold leading-snug text-foreground">
            {service.title}
          </h3>

          <span className="mt-3 inline-flex max-w-full items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <span className="truncate">{rateLabel}</span>
          </span>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
            {service.shortDescription}
          </p>

          <span className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 group-hover:bg-primary-hover">
            View service
            <ArrowUpRight size={15} />
          </span>
        </div>
      </Link>
    </article>
  );
}