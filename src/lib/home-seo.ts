import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import type { HeroSlide, PublicBlogPost, PublicProject, PublicService } from "@/lib/public-content";
import {
  buildBreadcrumbListNode,
  buildLocalBusinessNode,
  buildPublicPageMetadata,
  buildWebSiteNode,
  collectPreviewImageUrls,
  toAbsoluteImageUrls,
} from "@/lib/seo";
import { getBlogPageUrl } from "@/lib/blog-seo";
import { getProjectPageUrl } from "@/lib/project-seo";
import { getServicePageUrl } from "@/lib/service-seo";
import { siteConfig } from "@/lib/site";

type HomeCounts = {
  serviceCount: number;
  projectCount: number;
  blogCount: number;
};

export function getHomePageUrl() {
  return siteConfig.url;
}

export function collectHomePreviewImages(
  slides: HeroSlide[],
  services: PublicService[],
  projects: PublicProject[],
  blogPosts: PublicBlogPost[],
  fallbackLogo?: string | null,
) {
  const slideImages = slides
    .filter((slide) => slide.mediaType === "image" && slide.mediaUrl.trim())
    .map((slide) => ({ imageUrl: slide.mediaUrl }));

  return collectPreviewImageUrls(
    [...slideImages, ...services, ...projects, ...blogPosts],
    {
      limit: 4,
      fallbackLogo,
    },
  );
}

export function buildHomeMetadata(
  settings: PublicBusinessSettings,
  counts: HomeCounts,
  previewImages: string[],
): Metadata {
  const title = `POP False Ceiling Contractor in ${settings.city}`;
  const description = `${settings.businessName} provides POP false ceiling, PVC, gypsum, and wooden ceiling work in ${settings.city}. Browse ${counts.serviceCount} services, ${counts.projectCount} projects${counts.blogCount > 0 ? `, and ${counts.blogCount} articles` : ""}. Request a measured quotation on WhatsApp.`;
  const keywords = [
    "POP false ceiling",
    "false ceiling contractor",
    "PVC ceiling",
    "gypsum ceiling",
    "wooden ceiling",
    "ceiling repair",
    "ceiling work",
    settings.city,
    settings.businessName,
    ...settings.serviceAreas.split(",").map((area) => area.trim()),
  ].filter(Boolean);

  return buildPublicPageMetadata({
    title,
    description,
    url: getHomePageUrl(),
    settings,
    keywords,
    images: previewImages,
    imageAlt: `${settings.businessName} ceiling work in ${settings.city}`,
    openGraphType: "website",
  });
}

export function buildHomeJsonLd(
  settings: PublicBusinessSettings,
  services: PublicService[],
  projects: PublicProject[],
  blogPosts: PublicBlogPost[],
  previewImages: string[],
) {
  const pageUrl = getHomePageUrl();
  const publishedServices = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  );
  const absoluteImages = toAbsoluteImageUrls(previewImages);

  const graph: Record<string, unknown>[] = [
    buildLocalBusinessNode(settings),
    buildWebSiteNode(settings),
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `POP False Ceiling Contractor in ${settings.city}`,
      description: buildHomeMetadata(
        settings,
        {
          serviceCount: publishedServices.length,
          projectCount: projects.length,
          blogCount: blogPosts.length,
        },
        previewImages,
      ).description as string,
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      about: {
        "@id": `${siteConfig.url}/#business`,
      },
      primaryImageOfPage: absoluteImages[0]
        ? {
            "@type": "ImageObject",
            url: absoluteImages[0],
            caption: settings.businessName,
          }
        : undefined,
      breadcrumb: {
        "@id": `${pageUrl}#breadcrumb`,
      },
      inLanguage: "en-IN",
    },
    buildBreadcrumbListNode(pageUrl, [{ name: "Home", item: pageUrl }]),
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#services`,
      name: `Ceiling services in ${settings.city}`,
      numberOfItems: publishedServices.length,
      itemListElement: publishedServices.slice(0, 8).map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: service.title,
        url: getServicePageUrl(service.slug),
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#projects`,
      name: `Ceiling projects in ${settings.city}`,
      numberOfItems: projects.length,
      itemListElement: projects.slice(0, 8).map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: getProjectPageUrl(project.slug),
      })),
    },
  ];

  if (blogPosts.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#blog`,
      name: `Ceiling articles from ${settings.businessName}`,
      numberOfItems: blogPosts.length,
      itemListElement: blogPosts.slice(0, 8).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: getBlogPageUrl(post.slug),
      })),
    });
  }

  if (absoluteImages.length > 0) {
    graph.push({
      "@type": "ImageGallery",
      "@id": `${pageUrl}#gallery`,
      name: `${settings.businessName} ceiling work photos`,
      image: absoluteImages.map((url) => ({
        "@type": "ImageObject",
        url,
        contentUrl: url,
      })),
    });
  }

  return graph;
}