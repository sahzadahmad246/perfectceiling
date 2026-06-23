import {
  isServiceContentEmpty,
  prepareServicePageContent,
} from "@/lib/services";
import { services as fallbackServiceTitles } from "@/lib/site";

export const PROJECT_STATUSES = [
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
  { id: "on_hold", label: "On hold" },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["id"];

export type ProjectImageDraft = {
  id: string;
  url: string;
  storagePath: string;
};

export type ProjectGalleryImage = {
  url: string;
  caption: string;
};

export type ProjectListItem = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  serviceType: string | null;
  shortDescription: string | null;
  status: ProjectStatus;
  published: boolean;
  showOnHomepage: boolean;
  sortOrder: number;
  imageUrl: string | null;
  completedAt: string | null;
};

export type ProjectDetail = ProjectListItem & {
  description: string | null;
  images: ProjectImageDraft[];
  featuredImageUrl: string | null;
};

export type ProjectFormInput = {
  title: string;
  slug: string;
  location: string;
  serviceType: string;
  shortDescription: string;
  description: string;
  status: ProjectStatus;
  completedAt: string;
  images: ProjectImageDraft[];
  featuredImageUrl: string;
  published: boolean;
  showOnHomepage: boolean;
  sortOrder: string;
};

export const PROJECT_SERVICE_SUGGESTIONS = fallbackServiceTitles.map(
  (service) => service.title,
);

export function slugifyProjectTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureUniqueProjectSlug(
  title: string,
  existingSlugs: string[],
  currentSlug?: string,
) {
  const base = slugifyProjectTitle(title) || "project";
  const reserved = new Set(
    existingSlugs
      .map((slug) => slugifyProjectTitle(slug))
      .filter((slug) => slug && slug !== currentSlug),
  );

  if (!reserved.has(base)) {
    return base;
  }

  let index = 2;

  while (reserved.has(`${base}-${index}`)) {
    index += 1;
  }

  return `${base}-${index}`;
}

export function emptyProjectForm(): ProjectFormInput {
  return {
    title: "",
    slug: "",
    location: "",
    serviceType: "",
    shortDescription: "",
    description: "",
    status: "completed",
    completedAt: "",
    images: [],
    featuredImageUrl: "",
    published: false,
    showOnHomepage: true,
    sortOrder: "0",
  };
}

export function getProjectPublicPath(slug: string) {
  return `/projects/${slug}`;
}

export function getProjectGalleryImages(
  featuredImageUrl: string | null | undefined,
  images: string[] | null | undefined,
  afterImageUrl?: string | null,
  beforeImageUrl?: string | null,
) {
  const gallery: ProjectGalleryImage[] = [];
  const seen = new Set<string>();

  function addImage(url: string | null | undefined, caption = "") {
    const normalized = url?.trim();

    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    gallery.push({ url: normalized, caption });
  }

  addImage(featuredImageUrl);

  for (const image of images ?? []) {
    addImage(image);
  }

  addImage(afterImageUrl);
  addImage(beforeImageUrl);

  return gallery;
}

export function resolveProjectCardImageUrl(
  featuredImageUrl: string | null | undefined,
  images: string[] | null | undefined,
  afterImageUrl?: string | null,
  beforeImageUrl?: string | null,
) {
  return getProjectGalleryImages(
    featuredImageUrl,
    images,
    afterImageUrl,
    beforeImageUrl,
  )[0]?.url ?? null;
}

export function projectDetailToForm(project: ProjectDetail): ProjectFormInput {
  return {
    title: project.title,
    slug: project.slug,
    location: project.location ?? "",
    serviceType: project.serviceType ?? "",
    shortDescription: project.shortDescription ?? "",
    description: project.description ?? "",
    status: project.status,
    completedAt: project.completedAt ?? "",
    images: project.images,
    featuredImageUrl: project.featuredImageUrl ?? project.images[0]?.url ?? "",
    published: project.published,
    showOnHomepage: project.showOnHomepage,
    sortOrder: String(project.sortOrder),
  };
}

export function applyProjectSearch(projects: ProjectListItem[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return projects;
  }

  return projects.filter((project) => {
    const haystack = [
      project.title,
      project.location,
      project.serviceType,
      project.shortDescription,
      project.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function getProjectStatusLabel(status: ProjectStatus) {
  return PROJECT_STATUSES.find((option) => option.id === status)?.label ?? status;
}

export function hasProjectDraftContent(form: ProjectFormInput) {
  const empty = emptyProjectForm();

  return (
    form.title.trim() !== empty.title ||
    form.slug.trim() !== empty.slug ||
    form.location.trim() !== empty.location ||
    form.serviceType.trim() !== empty.serviceType ||
    form.shortDescription.trim() !== empty.shortDescription ||
    form.description.trim() !== empty.description ||
    form.completedAt.trim() !== empty.completedAt ||
    form.status !== empty.status ||
    form.published !== empty.published ||
    form.showOnHomepage !== empty.showOnHomepage ||
    form.sortOrder.trim() !== empty.sortOrder ||
    form.images.length > 0 ||
    form.featuredImageUrl.trim() !== empty.featuredImageUrl
  );
}

export function prepareProjectArticleContent(
  description: string | null,
  title: string,
  shortDescription: string,
) {
  if (!description?.trim() || isServiceContentEmpty(description)) {
    return "";
  }

  return prepareServicePageContent(description, {
    title,
    shortDescription,
    seoTitle: null,
    seoDescription: null,
  });
}