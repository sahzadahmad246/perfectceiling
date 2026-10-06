import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import type { Metadata } from "next";

import { PublicServiceDetailPage } from "@/components/public-service-detail-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import {
  getPublicServiceBySlug,
  getPublicServiceSlugs,
} from "@/lib/public-content";
import {
  buildServiceDetailMetadata,
} from "@/lib/service-seo";

export const revalidate = 60;

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPublicServiceSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    getPublicServiceBySlug(slug),
    getPublicBusinessSettings(),
  ]);

  if (!service) {
    return {
      title: "Service not found",
      robots: NON_INDEXABLE_ROBOTS,
    };
  }

  return buildServiceDetailMetadata(service, settings);
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;

  return <PublicServiceDetailPage slug={slug} />;
}