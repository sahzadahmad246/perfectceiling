import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import {
  buildHomeMetadata,
  collectHomePreviewImages,
} from "@/lib/home-seo";
import {
  getPublicBlogPosts,
  getPublicHeroSlides,
  getPublicProjects,
  getPublicServices,
} from "@/lib/public-content";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, slides, services, projects, blogPosts] = await Promise.all([
    getPublicBusinessSettings(),
    getPublicHeroSlides(),
    getPublicServices(),
    getPublicProjects(6),
    getPublicBlogPosts(),
  ]);

  const publishedServices = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  );

  return buildHomeMetadata(
    settings,
    {
      serviceCount: publishedServices.length,
      projectCount: projects.length,
      blogCount: blogPosts.length,
    },
    collectHomePreviewImages(
      slides,
      publishedServices,
      projects,
      blogPosts,
      settings.logoUrl,
    ),
  );
}

export default function Home() {
  return <LandingPage />;
}