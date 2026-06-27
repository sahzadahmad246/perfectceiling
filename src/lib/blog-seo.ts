import type { Metadata } from "next";

import type { PublicBlogPost } from "@/lib/public-content";
import type { PublicBusinessSettings } from "@/lib/business-settings";
import { getBlogPublicPath } from "@/lib/blog";
import {
  buildBreadcrumbListNode,
  buildLocalBusinessNode,
  buildPublicPageMetadata,
  buildWebSiteNode,
  collectPreviewImageUrls,
  resolveSeoImageUrls,
  toAbsoluteUrl,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function getBlogSeoTitle(post: PublicBlogPost) {
  return post.seoTitle?.trim() || post.title;
}

export function getBlogSeoDescription(post: PublicBlogPost) {
  return post.seoDescription?.trim() || post.excerpt?.trim() || post.title;
}

export function getBlogPageUrl(slug: string) {
  return `${siteConfig.url}${getBlogPublicPath(slug)}`;
}

export function getBlogListUrl() {
  return `${siteConfig.url}/blog`;
}

export function buildBlogListMetadata(
  settings: PublicBusinessSettings,
  posts: PublicBlogPost[],
): Metadata {
  const title = `Ceiling tips and guides in ${settings.city}`;
  const description = `Read ${posts.length > 0 ? `${posts.length} ` : ""}articles on false ceiling cost, POP vs PVC, gypsum ceiling, maintenance, and design ideas from ${settings.businessName} in ${settings.city}.`;
  const previewImages = collectPreviewImageUrls(posts, {
    limit: 4,
    fallbackLogo: settings.logoUrl,
  });

  return buildPublicPageMetadata({
    title,
    description,
    url: getBlogListUrl(),
    settings,
    keywords: [
      "false ceiling blog",
      "POP ceiling cost",
      "PVC ceiling guide",
      "gypsum ceiling tips",
      "ceiling maintenance",
      settings.city,
      settings.businessName,
    ],
    images: previewImages,
    imageAlt: `Ceiling articles from ${settings.businessName}`,
  });
}

export function buildBlogDetailMetadata(
  post: PublicBlogPost,
  settings: PublicBusinessSettings,
): Metadata {
  const title = getBlogSeoTitle(post);
  const description = getBlogSeoDescription(post);
  const images = resolveSeoImageUrls({
    featuredUrls: [post.featuredImageUrl, post.imageUrl],
    content: post.content,
    fallbackLogo: settings.logoUrl,
  });

  return buildPublicPageMetadata({
    title,
    description,
    url: getBlogPageUrl(post.slug),
    settings,
    keywords: [
      post.title,
      title,
      post.category ?? "",
      "false ceiling",
      settings.city,
      settings.businessName,
    ].filter((value) => Boolean(value.trim())),
    images,
    imageAlt: title,
    openGraphType: "article",
    publishedTime: post.publishedAt ?? undefined,
    modifiedTime: post.updatedAt ?? undefined,
  });
}

export function buildBlogListJsonLd(
  posts: PublicBlogPost[],
  settings: PublicBusinessSettings,
) {
  const pageUrl = getBlogListUrl();

  return [
    buildLocalBusinessNode(settings),
    buildWebSiteNode(settings),
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: `Ceiling tips and guides in ${settings.city}`,
      description: buildBlogListMetadata(settings, posts).description as string,
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
      { name: "Blog", item: pageUrl },
    ]),
    {
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      name: `Blog articles from ${settings.businessName}`,
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: getBlogPageUrl(post.slug),
      })),
    },
  ];
}

export function buildBlogDetailJsonLd(
  post: PublicBlogPost,
  settings: PublicBusinessSettings,
) {
  const pageUrl = getBlogPageUrl(post.slug);
  const title = getBlogSeoTitle(post);
  const description = getBlogSeoDescription(post);
  const imageUrls = resolveSeoImageUrls({
    featuredUrls: [post.featuredImageUrl, post.imageUrl],
    content: post.content,
    fallbackLogo: settings.logoUrl,
    limit: 8,
  });
  const absoluteImages = imageUrls.map((url) => toAbsoluteUrl(url));
  const primaryImage = absoluteImages[0];

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
      primaryImageOfPage: primaryImage
        ? {
            "@type": "ImageObject",
            url: primaryImage,
            caption: title,
          }
        : undefined,
      breadcrumb: {
        "@id": `${pageUrl}#breadcrumb`,
      },
      datePublished: post.publishedAt ?? undefined,
      dateModified: post.updatedAt ?? undefined,
      inLanguage: "en-IN",
    },
    buildBreadcrumbListNode(pageUrl, [
      { name: "Home", item: siteConfig.url },
      { name: "Blog", item: getBlogListUrl() },
      { name: post.title, item: pageUrl },
    ]),
    {
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: title,
      description,
      url: pageUrl,
      image: absoluteImages.length > 0 ? absoluteImages : undefined,
      datePublished: post.publishedAt ?? undefined,
      dateModified: post.updatedAt ?? undefined,
      author: {
        "@type": "Organization",
        name: settings.businessName,
      },
      publisher: {
        "@id": `${siteConfig.url}/#business`,
      },
      articleSection: post.category ?? undefined,
      inLanguage: "en-IN",
      mainEntityOfPage: {
        "@id": `${pageUrl}#webpage`,
      },
    },
  ];
}