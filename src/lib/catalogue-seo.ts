import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import {
  getCatalogueAltText,
  getCatalogueDisplayTitle,
  getCataloguePublicPath,
  getCatalogueSeoDescription,
} from "@/lib/catalogue";
import type { PublicCatalogueImage } from "@/lib/public-content";
import {
  buildBreadcrumbListNode,
  buildLocalBusinessNode,
  buildPublicPageMetadata,
  buildWebSiteNode,
  collectPreviewImageUrls,
  toAbsoluteUrl,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function getCataloguePageUrl(id: string) {
  return `${siteConfig.url}${getCataloguePublicPath(id)}`;
}

export function getCatalogueListUrl() {
  return `${siteConfig.url}/catalogue`;
}

export function buildCatalogueListMetadata(
  settings: PublicBusinessSettings,
  images: PublicCatalogueImage[],
): Metadata {
  const title = `Ceiling Design Catalogue in ${settings.city}`;
  const description = `Browse ${images.length > 0 ? `${images.length} ` : ""}false ceiling design ideas from ${settings.businessName} in ${settings.city}. POP, PVC, gypsum, and modern finishes to choose from.`;
  const previewImages = collectPreviewImageUrls(
    images.map((image) => ({ imageUrl: image.imageUrl })),
    {
      limit: 4,
      fallbackLogo: settings.logoUrl,
    },
  );

  return buildPublicPageMetadata({
    title,
    description,
    url: getCatalogueListUrl(),
    settings,
    keywords: [
      "ceiling designs",
      "false ceiling catalogue",
      "POP ceiling designs",
      "ceiling design ideas",
      settings.city,
      settings.businessName,
    ],
    images: previewImages,
    imageAlt: `Ceiling design catalogue in ${settings.city}`,
  });
}

export function buildCatalogueDetailMetadata(
  item: PublicCatalogueImage,
  settings: PublicBusinessSettings,
): Metadata {
  const title = getCatalogueDisplayTitle(item);
  const description = getCatalogueSeoDescription(item);
  const alt = getCatalogueAltText(item);

  return buildPublicPageMetadata({
    title,
    description,
    url: getCataloguePageUrl(item.id),
    settings,
    keywords: [
      title,
      "ceiling design",
      "false ceiling",
      "design catalogue",
      settings.city,
      settings.businessName,
    ],
    images: item.imageUrl ? [item.imageUrl] : [],
    imageAlt: alt,
    openGraphType: "article",
    modifiedTime: item.updatedAt ?? undefined,
  });
}

export function buildCatalogueListJsonLd(
  images: PublicCatalogueImage[],
  settings: PublicBusinessSettings,
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusinessNode(settings),
      buildWebSiteNode(settings),
      buildBreadcrumbListNode(getCatalogueListUrl(), [
        { name: "Home", item: siteConfig.url },
        { name: "Catalogue", item: getCatalogueListUrl() },
      ]),
      {
        "@type": "CollectionPage",
        "@id": `${getCatalogueListUrl()}#collection`,
        name: `Ceiling design catalogue in ${settings.city}`,
        url: getCatalogueListUrl(),
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${siteConfig.url}/#business` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: images.length,
          itemListElement: images.map((image, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: getCataloguePageUrl(image.id),
            name: getCatalogueDisplayTitle(image),
          })),
        },
      },
    ],
  };
}

export function buildCatalogueDetailJsonLd(
  item: PublicCatalogueImage,
  settings: PublicBusinessSettings,
) {
  const title = getCatalogueDisplayTitle(item);
  const description = getCatalogueSeoDescription(item);
  const alt = getCatalogueAltText(item);
  const pageUrl = getCataloguePageUrl(item.id);
  const imageUrl = item.imageUrl ? toAbsoluteUrl(item.imageUrl) : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildLocalBusinessNode(settings),
      buildWebSiteNode(settings),
      buildBreadcrumbListNode(pageUrl, [
        { name: "Home", item: siteConfig.url },
        { name: "Catalogue", item: getCatalogueListUrl() },
        { name: title, item: pageUrl },
      ]),
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}#image`,
        name: title,
        description,
        contentUrl: imageUrl,
        thumbnailUrl: imageUrl,
        caption: item.caption,
        url: pageUrl,
        creditText: settings.businessName,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${siteConfig.url}/#business` },
        ...(alt ? { alternateName: alt } : {}),
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        name: title,
        description,
        url: pageUrl,
        primaryImageOfPage: imageUrl
          ? { "@id": `${pageUrl}#image` }
          : undefined,
        isPartOf: { "@id": `${siteConfig.url}/#website` },
      },
    ],
  };
}
