import { cache } from "react";

import { hasSupabaseEnv } from "@/lib/env";
import {
  getProjectGalleryImages,
  getProjectPublicPath,
  type ProjectGalleryImage,
} from "@/lib/projects";
import {
  getServiceGalleryImages,
  resolveServiceCardImageUrl,
  type ServiceGalleryImage,
  type ServiceRateUnit,
} from "@/lib/services";
import { services as fallbackServices, siteConfig } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";

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
  updatedAt: string | null;
};

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
  };
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
        durationMs: 8000,
        href: getProjectPublicPath(project.slug),
      });
    }
  }

  return slides;
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
      "id, title, slug, location, service_type, description, short_description, images, featured_image_url, before_image_url, after_image_url, status, completed_at, show_on_homepage, sort_order",
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
    const slides = await fetchPublishedHeroSlides();

    if (slides.length > 0) {
      return slides;
    }

    const projects = await fetchPublishedProjects(8);
    const projectSlides = projectsToHeroSlides(projects);

    if (projectSlides.length > 0) {
      return projectSlides;
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

  const { data, error } = await supabase
    .from("services")
    .select(
      "id, title, slug, short_description, content, starting_price, rate_unit, seo_title, seo_description, featured_image_url, updated_at",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  return data.map((row) => mapPublicService(row as ServiceRow));
}

async function fetchPublishedServiceBySlug(
  slug: string,
): Promise<PublicService | null> {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("services")
    .select(
      "id, title, slug, short_description, content, starting_price, rate_unit, seo_title, seo_description, featured_image_url, updated_at",
    )
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapPublicService(data as ServiceRow);
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
      "id, title, slug, location, service_type, description, short_description, images, featured_image_url, before_image_url, after_image_url, status, completed_at, show_on_homepage, sort_order",
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