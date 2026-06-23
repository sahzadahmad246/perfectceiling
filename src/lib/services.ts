import { formatCurrency } from "@/lib/quotations";

export type ServiceRateUnit = "sq_ft" | "running_ft" | "piece" | "lump_sum";

export const SERVICE_RATE_UNITS: Array<{
  id: ServiceRateUnit;
  label: string;
}> = [
  { id: "sq_ft", label: "Per sq ft" },
  { id: "running_ft", label: "Per running ft" },
  { id: "piece", label: "Per piece" },
  { id: "lump_sum", label: "Lump sum" },
];

export type ServiceListItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  startingPrice: number | null;
  rateUnit: ServiceRateUnit | null;
  published: boolean;
  sortOrder: number;
  seoTitle: string | null;
  imageUrl: string | null;
};

export type ServiceDetail = ServiceListItem & {
  content: string | null;
  seoDescription: string | null;
  featuredImageUrl: string | null;
};

export type ServiceFormInput = {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  startingPrice: string;
  rateUnit: ServiceRateUnit | "";
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  sortOrder: string;
};

export function slugifyServiceTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureUniqueServiceSlug(
  baseSlug: string,
  existingSlugs: string[],
  excludeSlug?: string,
) {
  const normalizedBase = slugifyServiceTitle(baseSlug);

  if (!normalizedBase) {
    return "";
  }

  const taken = new Set(
    existingSlugs
      .map((slug) => slugifyServiceTitle(slug))
      .filter((slug) => slug && slug !== excludeSlug),
  );

  if (!taken.has(normalizedBase)) {
    return normalizedBase;
  }

  let suffix = 2;

  while (taken.has(`${normalizedBase}-${suffix}`)) {
    suffix += 1;
  }

  return `${normalizedBase}-${suffix}`;
}

export function getServiceContentPreview(content: string) {
  const stripped = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!stripped) {
    return "";
  }

  return stripped.length > 140 ? `${stripped.slice(0, 140)}…` : stripped;
}

export function isServiceContentEmpty(content: string) {
  return getServiceContentPreview(content).length === 0;
}

export function getServiceRateUnitLabel(unit: ServiceRateUnit | null | string) {
  return (
    SERVICE_RATE_UNITS.find((option) => option.id === unit)?.label ?? null
  );
}

export function formatServiceRate(
  startingPrice: number | null,
  rateUnit: ServiceRateUnit | null,
) {
  if (startingPrice === null || !Number.isFinite(startingPrice)) {
    return "Rate on request";
  }

  const unitLabel = getServiceRateUnitLabel(rateUnit);

  return unitLabel
    ? `From ${formatCurrency(startingPrice)} ${unitLabel.toLowerCase()}`
    : `From ${formatCurrency(startingPrice)}`;
}

export function getServicePublicPath(slug: string) {
  return `/services/${slug}`;
}

export type ServiceGalleryImage = {
  url: string;
  caption: string;
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripHtmlText(value: string) {
  return decodeHtmlEntities(
    value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  );
}

export function extractImagesFromServiceContent(content: string | null) {
  if (!content?.trim()) {
    return [];
  }

  const captionByUrl = new Map<string, string>();
  const figurePattern = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
  let figureMatch = figurePattern.exec(content);

  while (figureMatch) {
    const block = figureMatch[1];
    const srcMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
    const url = srcMatch?.[1]?.trim();

    if (url) {
      const figcaptionMatch = block.match(
        /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i,
      );
      const altMatch = block.match(/<img[^>]+alt=["']([^"']*)["']/i);
      const caption = figcaptionMatch
        ? stripHtmlText(figcaptionMatch[1])
        : altMatch
          ? decodeHtmlEntities(altMatch[1].trim())
          : "";

      if (caption) {
        captionByUrl.set(url, caption);
      }
    }

    figureMatch = figurePattern.exec(content);
  }

  const images: ServiceGalleryImage[] = [];
  const seen = new Set<string>();
  const imagePattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match = imagePattern.exec(content);

  while (match) {
    const tag = match[0];
    const url = match[1]?.trim();

    if (url && !seen.has(url)) {
      seen.add(url);
      const altMatch = tag.match(/alt=["']([^"']*)["']/i);
      const caption =
        captionByUrl.get(url) ??
        (altMatch ? decodeHtmlEntities(altMatch[1].trim()) : "");

      images.push({ url, caption });
    }

    match = imagePattern.exec(content);
  }

  return images;
}

export function extractFirstImageFromServiceContent(content: string | null) {
  return extractImagesFromServiceContent(content)[0]?.url ?? null;
}

export function stripImagesFromServiceContent(content: string | null) {
  if (!content?.trim()) {
    return "";
  }

  return content
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();
}

function normalizeComparableText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stripTextFromHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

type PrepareServicePageContentOptions = {
  title: string;
  shortDescription: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function prepareServicePageContent(
  content: string | null,
  options: PrepareServicePageContentOptions,
) {
  let html = stripImagesFromServiceContent(content)
    .replace(/<h1\b/gi, "<h2")
    .replace(/<\/h1>/gi, "</h2>");

  const duplicateTexts = new Set(
    [
      options.title,
      options.shortDescription,
      options.seoTitle,
      options.seoDescription,
    ]
      .filter((value): value is string => Boolean(value?.trim()))
      .map((value) => normalizeComparableText(value)),
  );

  let changed = true;

  while (changed && html) {
    changed = false;

    for (const tag of ["h1", "h2", "h3", "p"] as const) {
      const match = html.match(
        new RegExp(`^\\s*<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"),
      );

      if (!match) {
        continue;
      }

      const innerText = normalizeComparableText(stripTextFromHtml(match[1]));

      if (innerText && duplicateTexts.has(innerText)) {
        html = html.slice(match[0].length).trim();
        changed = true;
        break;
      }
    }
  }

  return html.trim();
}

export function getServiceGalleryImages(
  featuredImageUrl: string | null,
  content: string | null,
) {
  const gallery: ServiceGalleryImage[] = [];
  const seen = new Set<string>();

  function addImage(url: string | null | undefined, caption = "") {
    const normalized = url?.trim();

    if (!normalized) {
      return;
    }

    if (seen.has(normalized)) {
      const existing = gallery.find((item) => item.url === normalized);

      if (existing && !existing.caption && caption.trim()) {
        existing.caption = caption.trim();
      }

      return;
    }

    seen.add(normalized);
    gallery.push({ url: normalized, caption: caption.trim() });
  }

  addImage(featuredImageUrl);

  for (const image of extractImagesFromServiceContent(content)) {
    addImage(image.url, image.caption);
  }

  return gallery;
}

export function resolveServiceCardImageUrl(
  featuredImageUrl: string | null,
  content: string | null,
) {
  return featuredImageUrl ?? extractFirstImageFromServiceContent(content);
}

export function resolveServiceHeroImageUrl(featuredImageUrl: string | null) {
  return featuredImageUrl?.trim() || null;
}

export function applyServiceSearch(services: ServiceListItem[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return services;
  }

  return services.filter((service) => {
    const haystack = [
      service.title,
      service.slug,
      service.shortDescription,
      service.seoTitle ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function emptyServiceForm(): ServiceFormInput {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    content: "",
    startingPrice: "",
    rateUnit: "",
    seoTitle: "",
    seoDescription: "",
    published: false,
    sortOrder: "0",
  };
}

export function serviceDetailToForm(service: ServiceDetail): ServiceFormInput {
  return {
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    content: service.content ?? "",
    startingPrice:
      service.startingPrice !== null ? String(service.startingPrice) : "",
    rateUnit: service.rateUnit ?? "",
    seoTitle: service.seoTitle ?? "",
    seoDescription: service.seoDescription ?? "",
    published: service.published,
    sortOrder: String(service.sortOrder),
  };
}