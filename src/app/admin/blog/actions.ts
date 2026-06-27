"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import {
  resolveBlogCardImageUrl,
  slugifyBlogTitle,
  type BlogDetail,
  type BlogFormInput,
  type BlogListItem,
} from "@/lib/blog";
import { extractFirstImageFromServiceContent } from "@/lib/services";

const BLOG_TABLE = "blog_posts";

export type BlogActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

type ValidatedBlogData = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  category: string | null;
  seo_title: string;
  seo_description: string;
  published: boolean;
  published_at: string | null;
};

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
  published: boolean;
  published_at: string | null;
};

function mapBlogListItem(row: BlogRow): BlogListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    category: row.category,
    published: row.published,
    publishedAt: row.published_at,
    seoTitle: row.seo_title,
    imageUrl: resolveBlogCardImageUrl(row.featured_image_url, row.content),
  };
}

function mapBlogDetail(row: BlogRow): BlogDetail {
  return {
    ...mapBlogListItem(row),
    content: row.content,
    featuredImageUrl: row.featured_image_url,
    seoDescription: row.seo_description,
  };
}

function validateBlogInput(
  input: BlogFormInput,
  currentPublishedAt?: string | null,
): { error: string } | { data: ValidatedBlogData } {
  const title = input.title.trim();
  const slug = slugifyBlogTitle(input.slug || input.title);
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const category = input.category.trim();
  const contentValue = content || null;
  const featuredImageUrl = extractFirstImageFromServiceContent(contentValue);

  if (!title) {
    return { error: "Article title is required." } as const;
  }

  if (!slug) {
    return { error: "Article slug is required." } as const;
  }

  if (!excerpt) {
    return { error: "Excerpt is required." } as const;
  }

  let publishedAt: string | null = currentPublishedAt ?? null;

  if (input.published) {
    publishedAt = publishedAt ?? new Date().toISOString();
  } else {
    publishedAt = null;
  }

  return {
    data: {
      title,
      slug,
      excerpt,
      content: contentValue,
      featured_image_url: featuredImageUrl,
      category: category || null,
      seo_title: title,
      seo_description: excerpt,
      published: input.published,
      published_at: publishedAt,
    },
  } as const;
}

async function slugExists(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  slug: string,
  excludeId?: string,
) {
  let query = supabase.from(BLOG_TABLE).select("id").eq("slug", slug).limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function listBlogPosts(): Promise<BlogListItem[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from(BLOG_TABLE)
    .select(
      "id, title, slug, excerpt, content, featured_image_url, category, seo_title, published, published_at",
    )
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapBlogListItem(row as BlogRow));
}

export async function getBlogPostById(id: string): Promise<BlogDetail | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from(BLOG_TABLE)
    .select(
      "id, title, slug, excerpt, content, featured_image_url, category, seo_title, seo_description, published, published_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapBlogDetail(data as BlogRow) : null;
}

export async function createBlogPost(
  input: BlogFormInput,
): Promise<BlogActionResult> {
  const { supabase, user } = await requireAdmin();
  const validated = validateBlogInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  try {
    if (await slugExists(supabase, validated.data.slug)) {
      return { success: false, error: "A blog post with this slug already exists." };
    }

    const { data, error } = await supabase
      .from(BLOG_TABLE)
      .insert({
        ...validated.data,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Could not create blog post.",
      };
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${validated.data.slug}`);

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create blog post.",
    };
  }
}

export async function updateBlogPost(
  id: string,
  input: BlogFormInput,
): Promise<BlogActionResult> {
  const { supabase } = await requireAdmin();

  const { data: existing, error: existingError } = await supabase
    .from(BLOG_TABLE)
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  if (!existing) {
    return { success: false, error: "Blog post not found." };
  }

  const validated = validateBlogInput(
    input,
    (existing as { published_at: string | null }).published_at,
  );

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  try {
    if (await slugExists(supabase, validated.data.slug, id)) {
      return { success: false, error: "A blog post with this slug already exists." };
    }

    const { data, error } = await supabase
      .from(BLOG_TABLE)
      .update({
        ...validated.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Could not update blog post.",
      };
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${validated.data.slug}`);

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update blog post.",
    };
  }
}

export async function deleteBlogPost(id: string): Promise<BlogActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from(BLOG_TABLE).delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");

  return { success: true, id };
}