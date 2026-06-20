import { ArrowUpRight, Hammer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatServiceRate, getServicePublicPath } from "@/lib/services";
import { getServiceSeoDescription } from "@/lib/service-seo";
import type { PublicService } from "@/lib/public-content";

type PublicServiceCardProps = {
  service: PublicService;
};

export function PublicServiceCard({ service }: PublicServiceCardProps) {
  const href = getServicePublicPath(service.slug);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition duration-200 hover:border-border-strong">
      <Link className="block" href={href}>
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
          {service.imageUrl ? (
            <Image
              alt={`${service.title} — ${getServiceSeoDescription(service)}`}
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              fill
              sizes="560px"
              src={service.imageUrl}
              unoptimized={service.imageUrl.startsWith("http")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <Hammer size={28} strokeWidth={1.75} />
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-primary text-[17px] font-medium text-foreground">
                {service.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-foreground">
                {formatServiceRate(service.startingPrice, service.rateUnit)}
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                {service.shortDescription}
              </p>
            </div>
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border-soft text-muted transition group-hover:text-foreground">
              <ArrowUpRight size={15} />
            </span>
          </div>

        </div>
      </Link>
    </article>
  );
}