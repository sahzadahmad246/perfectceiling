import type { Metadata } from "next";

import type { PublicBusinessSettings } from "@/lib/business-settings";
import {
  getCatalogueDisplayTitle,
  getCatalogueImageAlt,
  getCatalogueImagePublicPath,
  getCatalogueImageSeoTitle,
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
  const imageCount = groups.reduce(
    (total, group) => total + group.images.length,
    0,
  );
  const description = `Browse ${imageCount > 0 ? `${imageCount} ` : ""}false ceiling design photos from ${settings.businessName} in ${settings.city}. POP, PVC, gypsum, and modern finishes to choose from.`;
  const previewImages = collectPreviewImageUrls(
    groups.map((group) => ({ imageUrl: group.previewImageUrl })),
    {
      limit: 8,
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
      "false ceiling photos",
      "POP ceiling designs",
      "PVC ceiling designs",
      "gypsum ceiling designs",
      "ceiling design ideas",
      "ceiling design images",
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

  const seoContext = {
    city: settings.city,
    businessName: settings.businessName,
  };

  if (sharedImage) {
    const imageTitle = getCatalogueImageSeoTitle(
      sharedImage,
      groupTitle,
      settings.city,
    );
    const description =
      sharedImage.subtitle?.trim()
        ? `${sharedImage.subtitle.trim()} — ${groupTitle} false ceiling design by ${settings.businessName} in ${settings.city}.`
        : getGroupDescription(item, settings);
    const alt = getCatalogueImageAlt(sharedImage, groupTitle, seoContext);
    const url = getCatalogueImageShareUrl(item.id, sharedImage.id);

    return buildPublicPageMetadata({
      title: imageTitle,
      description,
      url,
      settings,
      keywords: [
        sharedImage.subtitle?.trim() || groupTitle,
        groupTitle,
        "ceiling design photo",
        "false ceiling design",
        "false ceiling images",
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

  const title = `${groupTitle} ceiling designs in ${settings.city}`;
  const description = getGroupDescription(item, settings);
  const cover =
    item.images.find((image) => image.isThumbnail) ?? item.images[0];
  const alt = getCatalogueImageAlt(
    { subtitle: cover?.subtitle },
    groupTitle,
    seoContext,
  );

  return buildPublicPageMetadata({
    title,
    description,
    url: getCataloguePageUrl(item.id),
    settings,
    keywords: [
      groupTitle,
      `${groupTitle} ceiling design`,
      "ceiling design photos",
      "false ceiling",
      "false ceiling images",
      "design catalogue",
      settings.city,
      settings.businessName,
    ],
    images: item.images.map((image) => image.imageUrl).slice(0, 8),
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
    const alt = getCatalogueImageAlt(image, title, {
      city: settings.city,
      businessName: settings.businessName,
    });
    const imagePageUrl = getCatalogueImageShareUrl(item.id, image.id);
    const caption = image.subtitle?.trim() || `${title} ceiling design`;
    const extension = image.imageUrl.split("?")[0]?.split(".").pop()?.toLowerCase();
    const encodingFormat =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : extension === "gif"
            ? "image/gif"
            : "image/jpeg";

    return {
      "@type": "ImageObject",
      "@id": `${pageUrl}#image-${index + 1}`,
      name: caption,
      description: alt,
      contentUrl: imageUrl,
      thumbnailUrl: imageUrl,
      caption,
      url: imagePageUrl,
      encodingFormat,
      inLanguage: "en-IN",
      isFamilyFriendly: true,
      creator: { "@id": `${siteConfig.url}/#business` },
      copyrightHolder: { "@id": `${siteConfig.url}/#business` },
      creditText: settings.businessName,
      acquireLicensePage: pageUrl,
      license: pageUrl,
      representativeOfPage: image.id === cover?.id,
      ...(alt ? { alternateName: alt } : {}),
      ...(image.viewCount > 0
        ? {
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/ViewAction",
              userInteractionCount: image.viewCount,
            },
          }
        : {}),
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
        "@type": "ImageGallery",
        "@id": `${pageUrl}#gallery`,
        name: title,
        description,
        url: pageUrl,
        image: imageNodes.map((node) => ({ "@id": node["@id"] })),
        associatedMedia: imageNodes.map((node) => ({ "@id": node["@id"] })),
      },
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        name: title,
        description,
        url: pageUrl,
        primaryImageOfPage: primary ? { "@id": primary["@id"] } : undefined,
        hasPart: imageNodes.map((node) => ({ "@id": node["@id"] })),
        mainEntity: { "@id": `${pageUrl}#gallery` },
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        about: { "@id": `${siteConfig.url}/#business` },
        inLanguage: "en-IN",
      },
    ],
  };
}
