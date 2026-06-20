import { cache } from "react";

import { hasSupabaseEnv } from "@/lib/env";
import { services } from "@/lib/site";
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
};

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  serviceType: string | null;
  description: string | null;
  imageUrl: string | null;
  completedAt: string | null;
};

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
  images: string[] | null;
  before_image_url: string | null;
  after_image_url: string | null;
  completed_at: string | null;
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

function projectImageUrl(row: ProjectRow) {
  const images = row.images?.filter(Boolean) ?? [];

  return (
    row.after_image_url ??
    images[0] ??
    row.before_image_url ??
    null
  );
}

function mapProject(row: ProjectRow): PublicProject {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    location: row.location,
    serviceType: row.service_type,
    description: row.description,
    imageUrl: projectImageUrl(row),
    completedAt: row.completed_at,
  };
}

function projectsToHeroSlides(projects: PublicProject[]): HeroSlide[] {
  return projects
    .filter((project) => project.imageUrl)
    .map((project) => ({
      id: `project-${project.id}`,
      mediaType: "image" as const,
      mediaUrl: project.imageUrl!,
      posterUrl: null,
      theme: undefined,
      overlayTitle: project.title,
      overlaySubtitle:
        [project.serviceType, project.location].filter(Boolean).join(" · ") ||
        null,
      durationMs: 8000,
    }));
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

async function fetchPublishedProjects(limit = 8): Promise<PublicProject[]> {
  const supabase = createPublicClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, slug, location, service_type, description, images, before_image_url, after_image_url, completed_at",
    )
    .eq("published", true)
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

    const projects = await fetchPublishedProjects(6);
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
      return await fetchPublishedProjects(limit);
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

export function getPublicServices() {
  return services;
}