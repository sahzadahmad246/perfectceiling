import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import type { PublicService } from "@/lib/public-content";
import {
  buildBreadcrumbListNode,
  buildLocalBusinessNode,
  buildPublicPageMetadata,
  buildWebSiteNode,
  collectPreviewImageUrls,
  resolveSeoImageUrls,
  toAbsoluteImageUrls,
} from "@/lib/seo";
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
  services: PublicService[],
): Metadata {
  const publishedServices = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  );
  const title = `Ceiling Services in ${settings.city}`;
  const description = `Explore ${publishedServices.length > 0 ? `${publishedServices.length} ` : ""}POP false ceiling, PVC, gypsum, wooden ceiling, and repair services from ${settings.businessName} in ${settings.city}. View prices, photos, and request a measured quotation.`;
  const previewImages = collectPreviewImageUrls(publishedServices, {
    limit: 4,
    fallbackLogo: settings.logoUrl,
  });

  return buildPublicPageMetadata({
    title,
    description,
    url: getServicesListUrl(),
    settings,
    keywords: [
      "ceiling services",
      "POP false ceiling",
      "PVC ceiling",
      "gypsum ceiling",
      "wooden ceiling",
      "ceiling repair",
      settings.city,
      settings.businessName,
    ],
    images: previewImages,
    imageAlt: `Ceiling services in ${settings.city}`,
  });
}

export function buildServiceDetailMetadata(
  service: PublicService,
  settings: PublicBusinessSettings,
): Metadata {
  const title = getServiceSeoTitle(service);
  const description = getServiceSeoDescription(service);
  const galleryImages = getServiceGalleryImages(
    service.featuredImageUrl,
    service.content,
  );
  const images = resolveSeoImageUrls({
    featuredUrls: [service.featuredImageUrl, service.imageUrl],
    galleryUrls: galleryImages.map((image) => image.url),
    content: service.content,
    fallbackLogo: settings.logoUrl,
  });

  return buildPublicPageMetadata({
    title,
    description,
    url: getServicePageUrl(service.slug),
    settings,
    keywords: buildServiceKeywords(service, settings),
    images,
    imageAlt: title,
    openGraphType: "article",
    modifiedTime: service.updatedAt ?? undefined,
  });
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
    buildWebSiteNode(settings),
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `Ceiling Services in ${settings.city}`,
      description: buildServicesListMetadata(settings, services).description as string,
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
      { name: "Services", item: pageUrl },
    ]),
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
  const galleryImages = getServiceGalleryImages(
    service.featuredImageUrl,
    service.content,
  );
  const absoluteImages = toAbsoluteImageUrls(
    resolveSeoImageUrls({
      featuredUrls: [service.featuredImageUrl, service.imageUrl],
      galleryUrls: galleryImages.map((image) => image.url),
      content: service.content,
      fallbackLogo: settings.logoUrl,
    }),
  );

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
    buildBreadcrumbListNode(pageUrl, [
      { name: "Home", item: siteConfig.url },
      { name: "Services", item: getServicesListUrl() },
      { name: service.title, item: pageUrl },
    ]),
    serviceNode,
  ];
}