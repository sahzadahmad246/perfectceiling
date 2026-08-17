import { cache } from "react";

import { hasSupabaseEnv } from "@/lib/env";
import { resolveBlogCardImageUrl } from "@/lib/blog";
import {
  getProjectGalleryImages,
  getProjectPublicPath,
  type ProjectGalleryImage,
} from "@/lib/projects";
import { getCataloguePublicPath } from "@/lib/catalogue";
import {
  getServiceGalleryImages,
  getServicePublicPath,
  resolveServiceCardImageUrl,
  type ServiceGalleryImage,
  type ServiceRateUnit,
} from "@/lib/services";
import { services as fallbackServices, siteConfig } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";

let contentViewsReady: boolean | null = null;

async function hasContentViewColumns(
  supabase: NonNullable<ReturnType<typeof createPublicClient>>,
) {
  if (contentViewsReady === true) {
    return true;
  }

  const { error } = await supabase
    .from("catalogue_group_images")
    .select("view_count")
    .limit(1);

  contentViewsReady = !error;
  return contentViewsReady;
}

function withViewCountColumn(columns: string, enabled: boolean) {
  return enabled ? `${columns}, view_count` : columns;
}

const fallbackHeroSlides: HeroSlide[] = [
  {
    id: "fallback-homes",
    mediaType: "animated",
    mediaUrl: "",
    posterUrl: null,
    theme: "homes",
    overlayTitle: "POP false ceiling for homes",
    overlaySubtitle: "Measured work, clean finishing, and straightforward quotes.",
    durationMs: 8000,
  },
  {
    id: "fallback-shops",
    mediaType: "animated",
    mediaUrl: "",
    posterUrl: null,
    theme: "shops",
    overlayTitle: "Ceiling work for shops and showrooms",
    overlaySubtitle: "PVC, gypsum, and POP installs built for daily use.",
    durationMs: 8000,
  },
  {
    id: "fallback-offices",
    mediaType: "animated",
    mediaUrl: "",
    posterUrl: null,
    theme: "offices",
    overlayTitle: "Office ceilings with neat lighting lines",
    overlaySubtitle: "Gypsum layouts, cove lighting prep, and repair work.",
    durationMs: 8000,
  },
];

export type HeroSlide = {
  id: string;
  mediaType: "image" | "video" | "animated";
  mediaUrl: string;
  posterUrl: string | null;
  theme?: "homes" | "shops" | "offices";
  overlayTitle: string;
  overlaySubtitle: string | null;
  durationMs: number;
  href?: string | null;
};

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  serviceType: string | null;
  shortDescription: string | null;
  description: string | null;
  status: "ongoing" | "completed" | "on_hold";
  imageUrl: string | null;
  galleryImages: ProjectGalleryImage[];
  completedAt: string | null;
  updatedAt: string | null;
};

export type PublicService = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string | null;
  startingPrice: number | null;
  rateUnit: ServiceRateUnit | null;
  seoTitle: string | null;
  seoDescription: string | null;
  featuredImageUrl: string | null;
  imageUrl: string | null;
  galleryImages: ServiceGalleryImage[];
  viewCount: number;
  updatedAt: string | null;
};

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  featuredImageUrl: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  viewCount: number;
};

export type PublicCatalogueGroupImage = {
  id: string;
  imageUrl: string;
  subtitle: string | null;
  isThumbnail: boolean;
  viewCount: number;
};

/** Public catalogue group (e.g. "Moldings") with gallery photos. */
export type PublicCatalogueGroup = {
  id: string;
  title: string;
  description: string | null;
  previewImageUrl: string;
  images: PublicCatalogueGroupImage[];
  updatedAt: string | null;
};

/** @deprecated Use PublicCatalogueGroup */
export type PublicCatalogueImage = PublicCatalogueGroup;

type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  content: string | null;
  starting_price: number | string | null;
  rate_unit: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured_image_url: string | null;
  updated_at: string | null;
  view_count?: number | null;
};

function isServiceRateUnit(value: string | null): value is ServiceRateUnit {
  return ["sq_ft", "running_ft", "piece", "lump_sum"].includes(value ?? "");
}

function mapPublicService(row: ServiceRow): PublicService {
  const startingPrice =
    row.starting_price === null || row.starting_price === ""
      ? null
      : Number(row.starting_price);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    content: row.content,
    startingPrice: Number.isFinite(startingPrice) ? startingPrice : null,
    rateUnit: isServiceRateUnit(row.rate_unit) ? row.rate_unit : null,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    featuredImageUrl: row.featured_image_url,
    imageUrl: resolveServiceCardImageUrl(row.featured_image_url, row.content),
    galleryImages: getServiceGalleryImages(row.featured_image_url, row.content),
    viewCount: row.view_count ?? 0,
    updatedAt: row.updated_at,
  };
}

type HeroSlideRow = {
  id: string;
  media_type: string;
  media_url: string;
  poster_url: string | null;
  overlay_title: string;
  overlay_subtitle: string | null;
  duration_ms: number | null;
  sort_order: number;
};

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  service_type: string | null;
  description: string | null;
  short_description: string | null;
  images: string[] | null;
  featured_image_url: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  status: string | null;
  completed_at: string | null;
  show_on_homepage: boolean | null;
  sort_order: number | null;
  updated_at: string | null;
};

function mapHeroSlide(row: HeroSlideRow): HeroSlide {
  return {
    id: row.id,
    mediaType: row.media_type === "video" ? "video" : "image",
    mediaUrl: row.media_url,
    posterUrl: row.poster_url,
    overlayTitle: row.overlay_title,
    overlaySubtitle: row.overlay_subtitle,
    durationMs: row.duration_ms ?? 8000,
    theme: undefined,
  };
}

function mapProject(row: ProjectRow): PublicProject {
  const status =
    row.status === "ongoing" || row.status === "on_hold"
      ? row.status
      : "completed";
  const galleryImages = getProjectGalleryImages(
    row.featured_image_url,
    row.images,
    row.after_image_url,
    row.before_image_url,
  );

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    location: row.location,
    serviceType: row.service_type,
    shortDescription: row.short_description ?? row.description,
    description: row.description,
    status,
    imageUrl: galleryImages[0]?.url ?? null,
    galleryImages,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

const HERO_SLIDE_DURATION_MS = 5500;
const HERO_MAX_SLIDES = 16;

function catalogueToHeroSlides(groups: PublicCatalogueGroup[]): HeroSlide[] {
  const slides: HeroSlide[] = [];

  for (const group of groups) {
    const images =
      group.images.length > 0
        ? group.images
        : group.previewImageUrl
          ? [
              {
                id: "preview",
                imageUrl: group.previewImageUrl,
                subtitle: null,
                isThumbnail: true,
                viewCount: 0,
              },
            ]
          : [];

    for (const [index, image] of images.entries()) {
      if (!image.imageUrl?.trim()) {
        continue;
      }

      slides.push({
        id: `catalogue-${group.id}-${image.id}-${index}`,
        mediaType: "image",
        mediaUrl: image.imageUrl,
        posterUrl: null,
        theme: undefined,
        overlayTitle: group.title,
        overlaySubtitle: image.subtitle?.trim() || null,
        durationMs: HERO_SLIDE_DURATION_MS,
        href: getCataloguePublicPath(group.id),
      });
    }
  }

  return slides;
}

function projectsToHeroSlides(projects: PublicProject[]): HeroSlide[] {
  const slides: HeroSlide[] = [];

  for (const project of projects) {
    const images =
      project.galleryImages.length > 0
        ? project.galleryImages
        : project.imageUrl
          ? [{ url: project.imageUrl, caption: "" }]
          : [];

    for (const [index, image] of images.entries()) {
      if (!image.url?.trim()) {
        continue;
      }

      slides.push({
        id: `project-${project.id}-${index}`,
        mediaType: "image",
        mediaUrl: image.url,
        posterUrl: null,
        theme: undefined,
        overlayTitle: project.title,
        overlaySubtitle:
          [project.serviceType, project.location].filter(Boolean).join(" · ") ||
          null,
        durationMs: HERO_SLIDE_DURATION_MS,
        href: getProjectPublicPath(project.slug),
      });
    }
  }

  return slides;
}

function servicesToHeroSlides(services: PublicService[]): HeroSlide[] {
  const slides: HeroSlide[] = [];

  for (const service of services) {
    if (service.id.startsWith("fallback-")) {
      continue;
    }

    const images =
      service.galleryImages.length > 0
        ? service.galleryImages
        : service.featuredImageUrl || service.imageUrl
          ? [
              {
                url: service.featuredImageUrl || service.imageUrl || "",
                caption: "",
              },
            ]
          : [];

    for (const [index, image] of images.entries()) {
      if (!image.url?.trim()) {
        continue;
      }

      slides.push({
        id: `service-${service.id}-${index}`,
        mediaType: "image",
        mediaUrl: image.url,
        posterUrl: null,
        theme: undefined,
        overlayTitle: service.title,
        overlaySubtitle: service.shortDescription || null,
        durationMs: HERO_SLIDE_DURATION_MS,
        href: getServicePublicPath(service.slug),
      });
    }
  }

  return slides;
}

/** Prefer real photos; drop animated placeholders when we have media. */
function mergeHeroSlides(sources: HeroSlide[][]): HeroSlide[] {
  const seen = new Set<string>();
  const merged: HeroSlide[] = [];

  for (const batch of sources) {
    for (const slide of batch) {
      if (slide.mediaType === "animated") {
        continue;
      }

      const key = slide.mediaUrl?.trim();

      if (!key || seen.has(key)) {
        continue;
      }

      seen.add(key);
      merged.push({
        ...slide,
        durationMs: slide.durationMs || HERO_SLIDE_DURATION_MS,
      });

      if (merged.length >= HERO_MAX_SLIDES) {
        return merged;
      }
    }
  }

  return merged;
}

async function fetchPublishedHeroSlides(): Promise<HeroSlide[]> {
  const supabase = createPublicClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("hero_slides")
    .select(
      "id, media_type, media_url, poster_url, overlay_title, overlay_subtitle, duration_ms, sort_order",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  return data.map((row) => mapHeroSlide(row as HeroSlideRow));
}

async function fetchPublishedProjects(
  limit = 8,
  options?: { homepageOnly?: boolean },
): Promise<PublicProject[]> {
  const supabase = createPublicClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("projects")
    .select(
      "id, title, slug, location, service_type, description, short_description, images, featured_image_url, before_image_url, after_image_url, status, completed_at, show_on_homepage, sort_order, updated_at",
    )
    .eq("published", true);

  if (options?.homepageOnly) {
    query = query.eq("show_on_homepage", true);
  }

  const { data, error } = await query
    .order("sort_order", { ascending: true })
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data?.length) {
    return [];
  }

  return data.map((row) => mapProject(row as ProjectRow));
}

export const getPublicHeroSlides = cache(async (): Promise<HeroSlide[]> => {
  if (!hasSupabaseEnv()) {
    return fallbackHeroSlides;
  }

  try {
    // Merge all image sources so the hero actually carousels multiple photos.
    const [configured, catalogueGroups, projects, services] =
      await Promise.all([
        fetchPublishedHeroSlides(),
        fetchPublishedCatalogueGroups(12),
        fetchPublishedProjects(12),
        fetchPublishedServices(),
      ]);

    const merged = mergeHeroSlides([
      configured,
      catalogueToHeroSlides(catalogueGroups),
      projectsToHeroSlides(projects),
      servicesToHeroSlides(services),
    ]);

    if (merged.length > 0) {
      return merged;
    }

    return fallbackHeroSlides;
  } catch {
    return fallbackHeroSlides;
  }
});

export const getPublicProjects = cache(
  async (limit = 6): Promise<PublicProject[]> => {
    if (!hasSupabaseEnv()) {
      return [];
    }

    try {
      return await fetchPublishedProjects(limit, { homepageOnly: true });
    } catch {
      return [];
    }
  },
);

export const getAllPublicProjects = cache(async (): Promise<PublicProject[]> => {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    return await fetchPublishedProjects(100);
  } catch {
    return [];
  }
});

export const getPublicProjectCount = cache(async (): Promise<number> => {
  if (!hasSupabaseEnv()) {
    return 0;
  }

  try {
    const supabase = createPublicClient();

    if (!supabase) {
      return 0;
    }

    const { count, error } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("published", true);

    if (error) {
      return 0;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
});

async function fetchPublishedServices(): Promise<PublicService[]> {
  const supabase = createPublicClient();

  if (!supabase) {
    return [];
  }

  const includeViews = await hasContentViewColumns(supabase);
  const { data, error } = await supabase
    .from("services")
    .select(
      withViewCountColumn(
        "id, title, slug, short_description, content, starting_price, rate_unit, seo_title, seo_description, featured_image_url, updated_at",
        includeViews,
      ),
    )
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  return (data as unknown as ServiceRow[]).map(mapPublicService);
}

async function fetchPublishedServiceBySlug(
  slug: string,
): Promise<PublicService | null> {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const includeViews = await hasContentViewColumns(supabase);
  const { data, error } = await supabase
    .from("services")
    .select(
      withViewCountColumn(
        "id, title, slug, short_description, content, starting_price, rate_unit, seo_title, seo_description, featured_image_url, updated_at",
        includeViews,
      ),
    )
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapPublicService(data as unknown as ServiceRow);
}

export const getPublicServices = cache(async (): Promise<PublicService[]> => {
  if (!hasSupabaseEnv()) {
    return fallbackServices.map((service, index) => ({
      id: `fallback-${index}`,
      title: service.title,
      slug: service.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-"),
      shortDescription: service.description,
      content: null,
      startingPrice: null,
      rateUnit: null,
      seoTitle: service.title,
      seoDescription: service.description,
      featuredImageUrl: null,
      imageUrl: null,
      galleryImages: [],
      viewCount: 0,
      updatedAt: null,
    }));
  }

  try {
    const services = await fetchPublishedServices();

    if (services.length > 0) {
      return services;
    }

    return fallbackServices.map((service, index) => ({
      id: `fallback-${index}`,
      title: service.title,
      slug: service.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-"),
      shortDescription: service.description,
      content: null,
      startingPrice: null,
      rateUnit: null,
      seoTitle: service.title,
      seoDescription: service.description,
      featuredImageUrl: null,
      imageUrl: null,
      galleryImages: [],
      viewCount: 0,
      updatedAt: null,
    }));
  } catch {
    return [];
  }
});

export const getPublicServiceBySlug = cache(
  async (slug: string): Promise<PublicService | null> => {
    if (!hasSupabaseEnv()) {
      const services = await getPublicServices();
      return services.find((service) => service.slug === slug) ?? null;
    }

    try {
      return await fetchPublishedServiceBySlug(slug);
    } catch {
      return null;
    }
  },
);

export async function getPublicServiceSlugs() {
  const services = await getPublicServices();

  return services
    .filter((service) => !service.id.startsWith("fallback-"))
    .map((service) => service.slug);
}

export function getPublicServicePageUrl(slug: string) {
  return `${siteConfig.url}/services/${slug}`;
}

type CatalogueGroupRow = {
  id: string;
  title: string;
  description: string | null;
  updated_at: string | null;
};

type CatalogueGroupImageRow = {
  id: string;
  group_id: string;
  image_url: string;
  subtitle: string | null;
  is_thumbnail: boolean | null;
  sort_order: number | null;
  view_count?: number | null;
};

function mapPublicCatalogueGroup(
  row: CatalogueGroupRow,
  images: PublicCatalogueGroupImage[],
): PublicCatalogueGroup | null {
  const thumb = images.find((image) => image.isThumbnail);
  const previewImageUrl =
    thumb?.imageUrl?.trim() || images[0]?.imageUrl?.trim() || "";

  if (!previewImageUrl) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    previewImageUrl,
    images,
    updatedAt: row.updated_at,
  };
}

async function fetchPublishedCatalogueGroups(
  limit?: number,
): Promise<PublicCatalogueGroup[]> {
  const supabase = createPublicClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("catalogue_groups")
    .select("id, title, description, updated_at")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data: groups, error: groupsError } = await query;

  if (groupsError || !groups?.length) {
    return [];
  }

  const groupIds = groups.map((row) => row.id as string);

  const includeViews = await hasContentViewColumns(supabase);
  const { data: imageRows, error: imagesError } = await supabase
    .from("catalogue_group_images")
    .select(
      withViewCountColumn(
        "id, group_id, image_url, subtitle, is_thumbnail, sort_order",
        includeViews,
      ),
    )
    .in("group_id", groupIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (imagesError) {
    return [];
  }

  const imagesByGroup = new Map<string, PublicCatalogueGroupImage[]>();

  for (const row of (imageRows ?? []) as unknown as CatalogueGroupImageRow[]) {
    if (!row.image_url?.trim()) {
      continue;
    }

    const list = imagesByGroup.get(row.group_id) ?? [];
    list.push({
      id: row.id,
      imageUrl: row.image_url,
      subtitle: row.subtitle,
      isThumbnail: Boolean(row.is_thumbnail),
      viewCount: row.view_count ?? 0,
    });
    imagesByGroup.set(row.group_id, list);
  }

  return (groups as CatalogueGroupRow[])
    .map((row) => mapPublicCatalogueGroup(row, imagesByGroup.get(row.id) ?? []))
    .filter((group): group is PublicCatalogueGroup => Boolean(group));
}

async function fetchPublishedCatalogueGroupById(
  id: string,
): Promise<PublicCatalogueGroup | null> {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const { data: group, error: groupError } = await supabase
    .from("catalogue_groups")
    .select("id, title, description, updated_at")
    .eq("published", true)
    .eq("id", id)
    .maybeSingle();

  if (groupError || !group) {
    return null;
  }

  const includeViews = await hasContentViewColumns(supabase);
  const { data: imageRows, error: imagesError } = await supabase
    .from("catalogue_group_images")
    .select(
      withViewCountColumn(
        "id, group_id, image_url, subtitle, is_thumbnail, sort_order",
        includeViews,
      ),
    )
    .eq("group_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (imagesError) {
    return null;
  }

  const images = ((imageRows ?? []) as unknown as CatalogueGroupImageRow[])
    .filter((row) => row.image_url?.trim())
    .map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      subtitle: row.subtitle,
      isThumbnail: Boolean(row.is_thumbnail),
      viewCount: row.view_count ?? 0,
    }));

  return mapPublicCatalogueGroup(group as CatalogueGroupRow, images);
}

export const getPublicCatalogueGroups = cache(
  async (limit = 12): Promise<PublicCatalogueGroup[]> => {
    if (!hasSupabaseEnv()) {
      return [];
    }

    try {
      return await fetchPublishedCatalogueGroups(limit);
    } catch {
      return [];
    }
  },
);

export const getAllPublicCatalogueGroups = cache(
  async (): Promise<PublicCatalogueGroup[]> => {
    if (!hasSupabaseEnv()) {
      return [];
    }

    try {
      return await fetchPublishedCatalogueGroups();
    } catch {
      return [];
    }
  },
);

export const getPublicCatalogueGroupById = cache(
  async (id: string): Promise<PublicCatalogueGroup | null> => {
    if (!hasSupabaseEnv()) {
      return null;
    }

    try {
      return await fetchPublishedCatalogueGroupById(id);
    } catch {
      return null;
    }
  },
);

/** @deprecated Use getPublicCatalogueGroups */
export const getPublicCatalogueImages = getPublicCatalogueGroups;

/** @deprecated Use getAllPublicCatalogueGroups */
export const getAllPublicCatalogueImages = getAllPublicCatalogueGroups;

/** @deprecated Use getPublicCatalogueGroupById */
export const getPublicCatalogueImageById = getPublicCatalogueGroupById;

export async function getPublicCatalogueIds() {
  const groups = await getAllPublicCatalogueGroups();
  return groups.map((group) => group.id);
}

async function fetchPublishedProjectBySlug(
  slug: string,
): Promise<PublicProject | null> {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, slug, location, service_type, description, short_description, images, featured_image_url, before_image_url, after_image_url, status, completed_at, show_on_homepage, sort_order, updated_at",
    )
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProject(data as ProjectRow);
}

export const getPublicProjectBySlug = cache(
  async (slug: string): Promise<PublicProject | null> => {
    if (!hasSupabaseEnv()) {
      return null;
    }

    try {
      return await fetchPublishedProjectBySlug(slug);
    } catch {
      return null;
    }
  },
);

export async function getPublicProjectSlugs() {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = createPublicClient();

    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from("projects")
      .select("slug")
      .eq("published", true);

    if (error || !data) {
      return [];
    }

    return data.map((row) => row.slug as string);
  } catch {
    return [];
  }
}

export function getPublicProjectPageUrl(slug: string) {
  return `${siteConfig.url}${getProjectPublicPath(slug)}`;
}

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  category: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  updated_at: string | null;
  view_count?: number | null;
};

function mapPublicBlogPost(row: BlogRow): PublicBlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    featuredImageUrl: row.featured_image_url,
    imageUrl: resolveBlogCardImageUrl(row.featured_image_url, row.content),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    viewCount: row.view_count ?? 0,
  };
}

async function fetchPublishedBlogPosts(): Promise<PublicBlogPost[]> {
  const supabase = createPublicClient();

  if (!supabase) {
    return [];
  }

  const includeViews = await hasContentViewColumns(supabase);
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      withViewCountColumn(
        "id, title, slug, excerpt, content, featured_image_url, category, seo_title, seo_description, published_at, updated_at",
        includeViews,
      ),
    )
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("title", { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  return (data as unknown as BlogRow[]).map(mapPublicBlogPost);
}

async function fetchPublishedBlogPostBySlug(
  slug: string,
): Promise<PublicBlogPost | null> {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const includeViews = await hasContentViewColumns(supabase);
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      withViewCountColumn(
        "id, title, slug, excerpt, content, featured_image_url, category, seo_title, seo_description, published_at, updated_at",
        includeViews,
      ),
    )
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapPublicBlogPost(data as unknown as BlogRow);
}

export const getPublicBlogPosts = cache(async (): Promise<PublicBlogPost[]> => {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    return await fetchPublishedBlogPosts();
  } catch {
    return [];
  }
});

export const getPublicBlogPostBySlug = cache(
  async (slug: string): Promise<PublicBlogPost | null> => {
    if (!hasSupabaseEnv()) {
      return null;
    }

    try {
      return await fetchPublishedBlogPostBySlug(slug);
    } catch {
      return null;
    }
  },
);

export async function getPublicBlogSlugs() {
  const posts = await getPublicBlogPosts();

  return posts.map((post) => post.slug);
}