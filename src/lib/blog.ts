import {
  extractFirstImageFromServiceContent,
  getServiceContentPreview,
  isServiceContentEmpty,
  prepareServicePageContent,
} from "@/lib/services";

export const BLOG_CATEGORIES = [
  "Cost guide",
  "Comparison",
  "Maintenance",
  "Design ideas",
  "Materials",
] as const;

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  published: boolean;
  publishedAt: string | null;
  seoTitle: string | null;
  imageUrl: string | null;
};

export type BlogDetail = BlogListItem & {
  content: string | null;
  featuredImageUrl: string | null;
  seoDescription: string | null;
};

export type BlogFormInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
};

export function slugifyBlogTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureUniqueBlogSlug(
  baseSlug: string,
  existingSlugs: string[],
  excludeSlug?: string,
) {
  const normalizedBase = slugifyBlogTitle(baseSlug);

  if (!normalizedBase) {
    return "";
  }

  const taken = new Set(
    existingSlugs
      .map((slug) => slugifyBlogTitle(slug))
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

export function getBlogPublicPath(slug: string) {
  return `/blog/${slug}`;
}

export function getBlogContentPreview(content: string) {
  return getServiceContentPreview(content);
}

export function isBlogContentEmpty(content: string) {
  return isServiceContentEmpty(content);
}

export function resolveBlogCardImageUrl(
  featuredImageUrl: string | null,
  content: string | null,
) {
  return featuredImageUrl?.trim() || extractFirstImageFromServiceContent(content);
}

export function prepareBlogPageContent(
  content: string | null,
  options: {
    title: string;
    excerpt?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
  },
) {
  return prepareServicePageContent(content, {
    title: options.title,
    shortDescription: options.excerpt?.trim() || "",
    seoTitle: options.seoTitle,
    seoDescription: options.seoDescription,
  });
}

export function formatBlogPublishedDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function applyBlogSearch(posts: BlogListItem[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return posts;
  }

  return posts.filter((post) => {
    const haystack = [
      post.title,
      post.slug,
      post.excerpt ?? "",
      post.category ?? "",
      post.seoTitle ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function emptyBlogForm(): BlogFormInput {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    published: false,
  };
}

export function hasBlogDraftContent(form: BlogFormInput) {
  const empty = emptyBlogForm();

  return (
    form.title.trim() !== empty.title ||
    form.slug.trim() !== empty.slug ||
    form.excerpt.trim() !== empty.excerpt ||
    form.content.trim() !== empty.content ||
    form.category.trim() !== empty.category ||
    form.published !== empty.published
  );
}

export function blogDetailToForm(post: BlogDetail): BlogFormInput {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    category: post.category ?? "",
    published: post.published,
  };
}