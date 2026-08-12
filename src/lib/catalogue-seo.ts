import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import {
  getCatalogueDisplayTitle,
  getCatalogueImageAlt,
  getCatalogueImagePublicPath,
  getCataloguePublicPath,
} from "@/lib/catalogue";
import type {
  PublicCatalogueGroup,
  PublicCatalogueGroupImage,
} from "@/lib/public-content";
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

export function getCatalogueImageShareUrl(groupId: string, imageId: string) {
  return `${siteConfig.url}${getCatalogueImagePublicPath(groupId, imageId)}`;
}

export function getCatalogueListUrl() {
  return `${siteConfig.url}/catalogue`;
}

function getGroupDescription(
  item: PublicCatalogueGroup,
  settings: PublicBusinessSettings,
) {
  return (
    item.description?.trim() ||
    `${item.title} ceiling design ideas from ${settings.businessName} in ${settings.city}.`
  );
}

export function buildCatalogueListMetadata(
  settings: PublicBusinessSettings,
  groups: PublicCatalogueGroup[],
): Metadata {
  const title = `Ceiling Design Catalogue in ${settings.city}`;
  const description = `Browse ${groups.length > 0 ? `${groups.length} ` : ""}false ceiling design collections from ${settings.businessName} in ${settings.city}. POP, PVC, gypsum, and modern finishes to choose from.`;
  const previewImages = collectPreviewImageUrls(
    groups.map((group) => ({ imageUrl: group.previewImageUrl })),
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
  item: PublicCatalogueGroup,
  settings: PublicBusinessSettings,
  options?: { imageId?: string | null },
): Metadata {
  const groupTitle = getCatalogueDisplayTitle(item);
  const sharedImage: PublicCatalogueGroupImage | undefined = options?.imageId
    ? item.images.find((image) => image.id === options.imageId)
    : undefined;

  if (sharedImage) {
    const imageTitle =
      sharedImage.subtitle?.trim() || groupTitle;
    const description =
      sharedImage.subtitle?.trim()
        ? `${sharedImage.subtitle.trim()} — ${groupTitle} | ${settings.businessName}`
        : getGroupDescription(item, settings);
    const alt = getCatalogueImageAlt(sharedImage, groupTitle);
    const url = getCatalogueImageShareUrl(item.id, sharedImage.id);

    return buildPublicPageMetadata({
      title: imageTitle,
      description,
      url,
      settings,
      keywords: [
        imageTitle,
        groupTitle,
        "ceiling design",
        "false ceiling",
        "design catalogue",
        settings.city,
        settings.businessName,
      ],
      images: [sharedImage.imageUrl],
      imageAlt: alt,
      openGraphType: "article",
      modifiedTime: item.updatedAt ?? undefined,
    });
  }

  const title = groupTitle;
  const description = getGroupDescription(item, settings);
  const cover =
    item.images.find((image) => image.isThumbnail) ?? item.images[0];
  const alt = getCatalogueImageAlt(
    { subtitle: cover?.subtitle },
    title,
  );

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
    images: item.previewImageUrl ? [item.previewImageUrl] : [],
    imageAlt: alt,
    openGraphType: "article",
    modifiedTime: item.updatedAt ?? undefined,
  });
}

export function buildCatalogueListJsonLd(
  groups: PublicCatalogueGroup[],
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
          numberOfItems: groups.length,
          itemListElement: groups.map((group, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: getCataloguePageUrl(group.id),
            name: getCatalogueDisplayTitle(group),
          })),
        },
      },
    ],
  };
}

export function buildCatalogueDetailJsonLd(
  item: PublicCatalogueGroup,
  settings: PublicBusinessSettings,
) {
  const title = getCatalogueDisplayTitle(item);
  const description = getGroupDescription(item, settings);
  const pageUrl = getCataloguePageUrl(item.id);
  const cover =
    item.images.find((image) => image.isThumbnail) ?? item.images[0];
  const imageNodes = item.images.map((image, index) => {
    const imageUrl = image.imageUrl
      ? toAbsoluteUrl(image.imageUrl)
      : undefined;
    const alt = getCatalogueImageAlt(image, title);
    const imagePageUrl = getCatalogueImageShareUrl(item.id, image.id);

    return {
      "@type": "ImageObject",
      "@id": `${pageUrl}#image-${index + 1}`,
      name: image.subtitle?.trim() || title,
      contentUrl: imageUrl,
      thumbnailUrl: imageUrl,
      caption: image.subtitle?.trim() || title,
      url: imagePageUrl,
      ...(alt ? { alternateName: alt } : {}),
    };
  });

  const primary =
    imageNodes[
      Math.max(
        0,
        item.images.findIndex((image) => image.id === cover?.id),
      )
    ] ?? imageNodes[0];

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
      ...imageNodes,
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        name: title,
        description,
        url: pageUrl,
        primaryImageOfPage: primary ? { "@id": primary["@id"] } : undefined,
        hasPart: imageNodes.map((node) => ({ "@id": node["@id"] })),
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${siteConfig.url}/#business` },
      },
    ],
  };
}
