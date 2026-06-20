import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import type { PublicService } from "@/lib/public-content";
import {
  formatServiceRate,
  getServiceGalleryImages,
  getServicePublicPath,
  getServiceRateUnitLabel,
} from "@/lib/services";
import { siteConfig } from "@/lib/site";

export function getServiceSeoTitle(service: PublicService) {
  return service.seoTitle?.trim() || service.title;
}

export function getServiceSeoDescription(service: PublicService) {
  return service.seoDescription?.trim() || service.shortDescription;
}

export function getServicePageUrl(slug: string) {
  return `${siteConfig.url}${getServicePublicPath(slug)}`;
}

export function getServicesListUrl() {
  return `${siteConfig.url}/services`;
}

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

function buildServiceKeywords(
  service: PublicService,
  settings: PublicBusinessSettings,
) {
  const unitLabel = getServiceRateUnitLabel(service.rateUnit);

  return [
    service.title,
    getServiceSeoTitle(service),
    settings.city,
    settings.businessName,
    "false ceiling",
    "ceiling contractor",
    unitLabel,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());
}

export function buildServicesListMetadata(
  settings: PublicBusinessSettings,
  serviceCount: number,
): Metadata {
  const title = `Ceiling Services in ${settings.city}`;
  const description = `Explore ${serviceCount > 0 ? `${serviceCount} ` : ""}POP false ceiling, PVC, gypsum, wooden ceiling, and repair services from ${settings.businessName} in ${settings.city}. View prices, photos, and request a measured quotation.`;
  const pageUrl = getServicesListUrl();
  const keywords = [
    "ceiling services",
    "POP false ceiling",
    "PVC ceiling",
    "gypsum ceiling",
    "wooden ceiling",
    "ceiling repair",
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
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

export function buildServiceDetailMetadata(
  service: PublicService,
  settings: PublicBusinessSettings,
): Metadata {
  const title = getServiceSeoTitle(service);
  const description = getServiceSeoDescription(service);
  const pageUrl = getServicePageUrl(service.slug);
  const images = getServiceGalleryImages(service.featuredImageUrl, service.content);
  const ogImages = buildOpenGraphImages(
    images.length > 0 ? images : service.imageUrl ? [service.imageUrl] : [],
    title,
  );

  return {
    title,
    description,
    keywords: buildServiceKeywords(service, settings),
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
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
    areaServed: settings.city,
  };
}

export function buildServicesListJsonLd(
  services: PublicService[],
  settings: PublicBusinessSettings,
) {
  const pageUrl = getServicesListUrl();
  const publishedServices = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  );

  return [
    buildLocalBusinessNode(settings),
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `Ceiling Services in ${settings.city}`,
      description: buildServicesListMetadata(settings, publishedServices.length)
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
          name: "Services",
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      name: `Ceiling services in ${settings.city}`,
      numberOfItems: publishedServices.length,
      itemListElement: publishedServices.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: service.title,
        url: getServicePageUrl(service.slug),
      })),
    },
  ];
}

export function buildServiceDetailJsonLd(
  service: PublicService,
  settings: PublicBusinessSettings,
) {
  const pageUrl = getServicePageUrl(service.slug);
  const title = getServiceSeoTitle(service);
  const description = getServiceSeoDescription(service);
  const images = getServiceGalleryImages(service.featuredImageUrl, service.content);
  const absoluteImages = (images.length > 0 ? images : service.imageUrl ? [service.imageUrl] : [])
    .map((url) => toAbsoluteUrl(url));

  const serviceNode: Record<string, unknown> = {
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: service.title,
    description,
    url: pageUrl,
    image: absoluteImages.length > 0 ? absoluteImages : undefined,
    provider: {
      "@id": `${siteConfig.url}/#business`,
    },
    areaServed: settings.city,
    serviceType: service.title,
  };

  if (service.startingPrice !== null && Number.isFinite(service.startingPrice)) {
    serviceNode.offers = {
      "@type": "Offer",
      price: service.startingPrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      description: formatServiceRate(service.startingPrice, service.rateUnit),
    };
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
        "@id": `${pageUrl}#service`,
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
      dateModified: service.updatedAt ?? undefined,
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
          name: "Services",
          item: getServicesListUrl(),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: service.title,
          item: pageUrl,
        },
      ],
    },
    serviceNode,
  ];
}