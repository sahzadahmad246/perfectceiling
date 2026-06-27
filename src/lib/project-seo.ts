import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import type { PublicProject } from "@/lib/public-content";
import { getProjectPublicPath } from "@/lib/projects";
import {
  buildBreadcrumbListNode,
  buildLocalBusinessNode,
  buildPublicPageMetadata,
  buildWebSiteNode,
  collectPreviewImageUrls,
  resolveSeoImageUrls,
  toAbsoluteImageUrls,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function getProjectSeoTitle(project: PublicProject) {
  return project.title;
}

export function getProjectSeoDescription(
  project: PublicProject,
  settings: PublicBusinessSettings,
) {
  const shortDescription = project.shortDescription?.trim();

  if (shortDescription) {
    return shortDescription;
  }

  const context = [
    project.serviceType,
    project.location,
    settings.city,
    settings.businessName,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" · ");

  return `${project.title}${context ? ` — ${context}` : ""}. View photos and project details.`;
}

export function getProjectPageUrl(slug: string) {
  return `${siteConfig.url}${getProjectPublicPath(slug)}`;
}

export function getProjectsListUrl() {
  return `${siteConfig.url}/projects`;
}

function buildProjectKeywords(
  project: PublicProject,
  settings: PublicBusinessSettings,
) {
  return [
    project.title,
    project.serviceType,
    project.location,
    settings.city,
    settings.businessName,
    "false ceiling project",
    "ceiling work",
    "POP ceiling",
    "completed project",
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());
}

export function buildProjectsListMetadata(
  settings: PublicBusinessSettings,
  projects: PublicProject[],
): Metadata {
  const title = `Completed Ceiling Projects in ${settings.city}`;
  const description = `Browse ${projects.length > 0 ? `${projects.length} ` : ""}completed POP, PVC, gypsum, and false ceiling projects by ${settings.businessName} in ${settings.city}. View photos, locations, and request a similar quotation.`;
  const previewImages = collectPreviewImageUrls(projects, {
    limit: 4,
    fallbackLogo: settings.logoUrl,
  });

  return buildPublicPageMetadata({
    title,
    description,
    url: getProjectsListUrl(),
    settings,
    keywords: [
      "ceiling projects",
      "false ceiling portfolio",
      "POP ceiling work",
      "completed ceiling projects",
      settings.city,
      settings.businessName,
    ],
    images: previewImages,
    imageAlt: `Ceiling projects in ${settings.city}`,
  });
}

export function buildProjectDetailMetadata(
  project: PublicProject,
  settings: PublicBusinessSettings,
): Metadata {
  const title = getProjectSeoTitle(project);
  const description = getProjectSeoDescription(project, settings);
  const images = resolveSeoImageUrls({
    featuredUrls: [project.imageUrl],
    galleryUrls: project.galleryImages.map((image) => image.url),
    content: project.description,
    fallbackLogo: settings.logoUrl,
  });

  return buildPublicPageMetadata({
    title,
    description,
    url: getProjectPageUrl(project.slug),
    settings,
    keywords: buildProjectKeywords(project, settings),
    images,
    imageAlt: title,
    openGraphType: "article",
    publishedTime: project.completedAt ?? undefined,
    modifiedTime: project.updatedAt ?? undefined,
  });
}

export function buildProjectsListJsonLd(
  projects: PublicProject[],
  settings: PublicBusinessSettings,
) {
  const pageUrl = getProjectsListUrl();

  return [
    buildLocalBusinessNode(settings),
    buildWebSiteNode(settings),
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `Completed ceiling projects in ${settings.city}`,
      description: buildProjectsListMetadata(settings, projects).description as string,
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      about: {
        "@id": `${siteConfig.url}/#business`,
      },
      inLanguage: "en-IN",
    },
    buildBreadcrumbListNode(pageUrl, [
      { name: "Home", item: siteConfig.url },
      { name: "Projects", item: pageUrl },
    ]),
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      name: `Ceiling projects in ${settings.city}`,
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: getProjectPageUrl(project.slug),
      })),
    },
  ];
}

export function buildProjectDetailJsonLd(
  project: PublicProject,
  settings: PublicBusinessSettings,
) {
  const pageUrl = getProjectPageUrl(project.slug);
  const title = getProjectSeoTitle(project);
  const description = getProjectSeoDescription(project, settings);
  const absoluteImages = toAbsoluteImageUrls(
    resolveSeoImageUrls({
      featuredUrls: [project.imageUrl],
      galleryUrls: project.galleryImages.map((image) => image.url),
      content: project.description,
      fallbackLogo: settings.logoUrl,
    }),
  );

  const articleNode: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: title,
    description,
    url: pageUrl,
    image: absoluteImages.length > 0 ? absoluteImages : undefined,
    author: {
      "@id": `${siteConfig.url}/#business`,
    },
    publisher: {
      "@id": `${siteConfig.url}/#business`,
    },
    articleSection: project.serviceType ?? "Ceiling work",
    inLanguage: "en-IN",
  };

  if (project.completedAt) {
    articleNode.datePublished = project.completedAt;
  }

  if (project.updatedAt) {
    articleNode.dateModified = project.updatedAt;
  }

  return [
    buildLocalBusinessNode(settings),
    buildWebSiteNode(settings),
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      about: {
        "@id": `${pageUrl}#article`,
      },
      primaryImageOfPage:
        absoluteImages[0] !== undefined
          ? {
              "@type": "ImageObject",
              url: absoluteImages[0],
              caption: title,
            }
          : undefined,
      breadcrumb: {
        "@id": `${pageUrl}#breadcrumb`,
      },
      dateModified: project.updatedAt ?? undefined,
      inLanguage: "en-IN",
    },
    buildBreadcrumbListNode(pageUrl, [
      { name: "Home", item: siteConfig.url },
      { name: "Projects", item: getProjectsListUrl() },
      { name: project.title, item: pageUrl },
    ]),
    articleNode,
  ];
}