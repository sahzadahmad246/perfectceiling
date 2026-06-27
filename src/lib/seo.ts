import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import { extractImagesFromServiceContent } from "@/lib/services";
import { siteConfig } from "@/lib/site";

export const INDEXABLE_ROBOTS: Metadata["robots"] = {
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

export function toAbsoluteUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${siteConfig.url}${url.startsWith("/") ? url : `/${url}`}`;
}

export function buildOpenGraphImages(images: string[], alt: string) {
  return images.slice(0, 4).map((url) => ({
    url: toAbsoluteUrl(url),
    alt,
    width: 1200,
    height: 630,
  }));
}

export function buildLocalBusinessNode(settings: PublicBusinessSettings) {
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

export function buildWebSiteNode(settings: PublicBusinessSettings) {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: settings.businessName,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#business`,
    },
    inLanguage: "en-IN",
  };
}

export function collectContentImageUrls(
  content: string | null | undefined,
  limit = 4,
) {
  return extractImagesFromServiceContent(content ?? null)
    .map((image) => image.url)
    .slice(0, limit);
}

type PreviewImageSource = {
  imageUrl?: string | null;
  featuredImageUrl?: string | null;
  content?: string | null;
  galleryImages?: Array<{ url: string }>;
};

export function collectPreviewImageUrls(
  sources: PreviewImageSource[],
  options?: {
    limit?: number;
    fallbackLogo?: string | null;
  },
) {
  const limit = options?.limit ?? 4;
  const seen = new Set<string>();
  const urls: string[] = [];

  function add(url: string | null | undefined) {
    const normalized = url?.trim();

    if (!normalized || seen.has(normalized) || urls.length >= limit) {
      return;
    }

    seen.add(normalized);
    urls.push(normalized);
  }

  for (const source of sources) {
    add(source.featuredImageUrl);
    add(source.imageUrl);

    if (source.galleryImages) {
      for (const image of source.galleryImages) {
        add(image.url);

        if (urls.length >= limit) {
          break;
        }
      }
    }

    for (const imageUrl of collectContentImageUrls(source.content, limit)) {
      add(imageUrl);

      if (urls.length >= limit) {
        break;
      }
    }

    if (urls.length >= limit) {
      break;
    }
  }

  if (urls.length === 0) {
    add(options?.fallbackLogo);
  }

  return urls;
}

export function resolveSeoImageUrls(options: {
  featuredUrls?: Array<string | null | undefined>;
  galleryUrls?: string[];
  content?: string | null;
  fallbackLogo?: string | null;
  limit?: number;
}) {
  return collectPreviewImageUrls(
    [
      {
        featuredImageUrl: options.featuredUrls?.[0],
        imageUrl: options.featuredUrls?.find((url) => url?.trim()),
        galleryImages: options.galleryUrls?.map((url) => ({ url })),
        content: options.content,
      },
    ],
    {
      limit: options.limit,
      fallbackLogo: options.fallbackLogo,
    },
  );
}

export type BuildPublicPageMetadataInput = {
  title: string;
  description: string;
  url: string;
  settings: PublicBusinessSettings;
  keywords?: string[];
  images?: string[];
  imageAlt?: string;
  openGraphType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildPublicPageMetadata(
  input: BuildPublicPageMetadataInput,
): Metadata {
  const imageAlt = input.imageAlt ?? input.title;
  const imageCandidates =
    input.images && input.images.length > 0
      ? input.images
      : input.settings.logoUrl
        ? [input.settings.logoUrl]
        : [];
  const ogImages = buildOpenGraphImages(imageCandidates, imageAlt);
  const hasImages = ogImages.length > 0;
  const listTitle =
    input.openGraphType === "article"
      ? input.title
      : `${input.title} | ${input.settings.businessName}`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: input.url,
    },
    robots: INDEXABLE_ROBOTS,
    openGraph: {
      title: listTitle,
      description: input.description,
      url: input.url,
      siteName: input.settings.businessName,
      locale: "en_IN",
      type: input.openGraphType ?? "website",
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
      images: hasImages ? ogImages : undefined,
    },
    twitter: {
      card: hasImages ? "summary_large_image" : "summary",
      title: listTitle,
      description: input.description,
      images: hasImages ? ogImages.map((image) => image.url) : undefined,
    },
  };
}

export function buildBreadcrumbListNode(
  pageUrl: string,
  items: Array<{ name: string; item?: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function toAbsoluteImageUrls(urls: string[]) {
  return urls.map((url) => toAbsoluteUrl(url));
}