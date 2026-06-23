import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import type { PublicProject } from "@/lib/public-content";
import { getProjectPublicPath } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

const indexableRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

function toAbsoluteUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${siteConfig.url}${url.startsWith("/") ? url : `/${url}`}`;
}

function buildOpenGraphImages(images: string[], alt: string) {
  return images.slice(0, 4).map((url) => ({
    url: toAbsoluteUrl(url),
    alt,
    width: 1200,
    height: 750,
  }));
}

function buildLocalBusinessNode(settings: PublicBusinessSettings) {
  return {
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: settings.businessName,
    url: siteConfig.url,
    telephone: settings.phone,
    email: settings.email,
    image: settings.logoUrl ? toAbsoluteUrl(settings.logoUrl) : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.city,
      addressCountry: "IN",
    },
    areaServed: settings.serviceAreas || settings.city,
  };
}

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
  projectCount: number,
): Metadata {
  const title = `Completed Ceiling Projects in ${settings.city}`;
  const description = `Browse ${projectCount > 0 ? `${projectCount} ` : ""}completed POP, PVC, gypsum, and false ceiling projects by ${settings.businessName} in ${settings.city}. View photos, locations, and request a similar quotation.`;
  const pageUrl = getProjectsListUrl();
  const keywords = [
    "ceiling projects",
    "false ceiling portfolio",
    "POP ceiling work",
    "completed ceiling projects",
    settings.city,
    settings.businessName,
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: pageUrl,
    },
    robots: indexableRobots,
    openGraph: {
      title: `${title} | ${settings.businessName}`,
      description,
      url: pageUrl,
      siteName: settings.businessName,
      locale: "en_IN",
      type: "website",
      images: settings.logoUrl
        ? buildOpenGraphImages([settings.logoUrl], settings.businessName)
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${settings.businessName}`,
      description,
      images: settings.logoUrl ? [toAbsoluteUrl(settings.logoUrl)] : undefined,
    },
  };
}

export function buildProjectDetailMetadata(
  project: PublicProject,
  settings: PublicBusinessSettings,
): Metadata {
  const title = getProjectSeoTitle(project);
  const description = getProjectSeoDescription(project, settings);
  const pageUrl = getProjectPageUrl(project.slug);
  const images = project.galleryImages.map((image) => image.url);
  const ogImages = buildOpenGraphImages(
    images.length > 0 ? images : project.imageUrl ? [project.imageUrl] : [],
    title,
  );

  return {
    title,
    description,
    keywords: buildProjectKeywords(project, settings),
    alternates: {
      canonical: pageUrl,
    },
    robots: indexableRobots,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: settings.businessName,
      locale: "en_IN",
      type: "article",
      images: ogImages.length > 0 ? ogImages : undefined,
    },
    twitter: {
      card: ogImages.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages.length > 0 ? ogImages.map((image) => image.url) : undefined,
    },
  };
}

export function buildProjectsListJsonLd(
  projects: PublicProject[],
  settings: PublicBusinessSettings,
) {
  const pageUrl = getProjectsListUrl();

  return [
    buildLocalBusinessNode(settings),
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `Completed ceiling projects in ${settings.city}`,
      description: buildProjectsListMetadata(settings, projects.length)
        .description as string,
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      about: {
        "@id": `${siteConfig.url}/#business`,
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Projects",
          item: pageUrl,
        },
      ],
    },
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
  const images = project.galleryImages.map((image) => image.url);
  const absoluteImages = (images.length > 0
    ? images
    : project.imageUrl
      ? [project.imageUrl]
      : []
  ).map((url) => toAbsoluteUrl(url));

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
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: settings.businessName,
      publisher: {
        "@id": `${siteConfig.url}/#business`,
      },
      inLanguage: "en-IN",
    },
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
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Projects",
          item: getProjectsListUrl(),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: project.title,
          item: pageUrl,
        },
      ],
    },
    articleNode,
  ];
}