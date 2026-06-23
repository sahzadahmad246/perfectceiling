import type { Metadata } from "next";

import { PublicProjectDetailPage } from "@/components/public-project-detail-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import {
  getPublicProjectBySlug,
  getPublicProjectSlugs,
} from "@/lib/public-content";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPublicProjectSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getPublicProjectBySlug(slug),
    getPublicBusinessSettings(),
  ]);

  if (!project) {
    return {
      title: "Project not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    project.shortDescription?.trim() || `${project.title} by ${settings.businessName}`;

  return {
    title: `${project.title} | ${settings.businessName}`,
    description,
    openGraph: {
      title: project.title,
      description,
      images: project.imageUrl ? [{ url: project.imageUrl }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;

  return <PublicProjectDetailPage slug={slug} />;
}