"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import {
  PROJECT_STATUSES,
  projectDetailToForm,
  slugifyProjectTitle,
  type ProjectDetail,
  type ProjectFormInput,
  type ProjectImageDraft,
  type ProjectListItem,
  type ProjectStatus,
} from "@/lib/projects";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getImageMimeType,
  isUploadFile,
  MAX_UPLOAD_IMAGE_SIZE,
  normalizeUploadFileName,
} from "@/lib/upload-image";

const PROJECTS_TABLE = "projects";
const ASSETS_BUCKET = "business-assets";

export type ProjectActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type ProjectImageActionResult =
  | { success: true; image: ProjectImageDraft }
  | { success: false; error: string };

type ValidatedProjectData = {
  title: string;
  slug: string;
  location: string | null;
  service_type: string | null;
  short_description: string;
  description: string | null;
  status: ProjectStatus;
  completed_at: string | null;
  images: string[];
  featured_image_url: string | null;
  published: boolean;
  show_on_homepage: boolean;
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
  published: boolean;
  show_on_homepage: boolean | null;
  sort_order: number | null;
};

function isProjectStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.some((option) => option.id === value);
}

function parseSortOrder(value: string) {
  const parsed = Number.parseInt(value.trim(), 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

function mapProjectListItem(row: ProjectRow): ProjectListItem {
  const images = row.images?.filter(Boolean) ?? [];

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    location: row.location,
    serviceType: row.service_type,
    shortDescription: row.short_description ?? row.description,
    status: isProjectStatus(row.status ?? "")
      ? (row.status as ProjectStatus)
      : "completed",
    published: row.published,
    showOnHomepage: row.show_on_homepage ?? true,
    sortOrder: row.sort_order ?? 0,
    imageUrl:
      row.featured_image_url ??
      images[0] ??
      row.after_image_url ??
      row.before_image_url ??
      null,
    completedAt: row.completed_at,
  };
}

function mapProjectDetail(row: ProjectRow): ProjectDetail {
  const images = row.images?.filter(Boolean) ?? [];

  return {
    ...mapProjectListItem(row),
    description: row.description,
    featuredImageUrl: row.featured_image_url,
    images: images.map((url, index) => ({
      id: `${row.id}-${index}`,
      url,
      storagePath: "",
    })),
  };
}

function validateProjectInput(
  input: ProjectFormInput,
): { error: string } | { data: ValidatedProjectData } {
  const title = input.title.trim();
  const slug = slugifyProjectTitle(input.slug || input.title);
  const shortDescription = input.shortDescription.trim();
  const description = input.description.trim();
  const location = input.location.trim();
  const serviceType = input.serviceType.trim();
  const status = isProjectStatus(input.status) ? input.status : "completed";
  const completedAt = input.completedAt.trim();
  const sortOrder = parseSortOrder(input.sortOrder);
  const imageUrls = input.images.map((image) => image.url.trim()).filter(Boolean);
  const featuredImageUrl =
    input.featuredImageUrl.trim() ||
    imageUrls[0] ||
    null;

  if (!title) {
    return { error: "Project title is required." };
  }

  if (!slug) {
    return { error: "Project slug is required." };
  }

  if (!shortDescription) {
    return { error: "Short description is required." };
  }

  return {
    data: {
      title,
      slug,
      location: location || null,
      service_type: serviceType || null,
      short_description: shortDescription,
      description: description || null,
      status,
      completed_at: completedAt || null,
      images: imageUrls,
      featured_image_url: featuredImageUrl,
      published: input.published,
      show_on_homepage: input.showOnHomepage,
      sort_order: sortOrder,
    },
  };
}

async function slugExists(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  slug: string,
  excludeId?: string,
) {
  let query = supabase.from(PROJECTS_TABLE).select("id").eq("slug", slug).limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select(
      "id, title, slug, location, service_type, description, short_description, images, featured_image_url, before_image_url, after_image_url, status, completed_at, published, show_on_homepage, sort_order",
    )
    .order("sort_order", { ascending: true })
    .order("completed_at", { ascending: false, nullsFirst: false })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapProjectListItem(row as ProjectRow));
}

export async function getProjectById(id: string): Promise<ProjectDetail | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select(
      "id, title, slug, location, service_type, description, short_description, images, featured_image_url, before_image_url, after_image_url, status, completed_at, published, show_on_homepage, sort_order",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProjectDetail(data as ProjectRow) : null;
}

export async function createProject(
  input: ProjectFormInput,
): Promise<ProjectActionResult> {
  const { supabase, user } = await requireAdmin();
  const validated = validateProjectInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  try {
    if (await slugExists(supabase, validated.data.slug)) {
      return { success: false, error: "A project with this slug already exists." };
    }

    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
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
        error: error?.message ?? "Could not create project.",
      };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create project.",
    };
  }
}

export async function updateProject(
  id: string,
  input: ProjectFormInput,
): Promise<ProjectActionResult> {
  const { supabase } = await requireAdmin();
  const validated = validateProjectInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  try {
    if (await slugExists(supabase, validated.data.slug, id)) {
      return { success: false, error: "A project with this slug already exists." };
    }

    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
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
        error: error?.message ?? "Could not update project.",
      };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update project.",
    };
  }
}

export async function deleteProject(id: string): Promise<ProjectActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from(PROJECTS_TABLE).delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");

  return { success: true, id };
}

export async function uploadProjectImage(
  formData: FormData,
): Promise<ProjectImageActionResult> {
  const file = formData.get("file");
  const storageKey = String(formData.get("storageKey") ?? "").trim();

  if (!storageKey) {
    return { success: false, error: "Upload reference is missing." };
  }

  if (!isUploadFile(file) || file.size === 0) {
    return { success: false, error: "Please select an image file." };
  }

  const mimeType = getImageMimeType(file);

  if (!mimeType) {
    return { success: false, error: "Use PNG, JPG, or WEBP." };
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    return { success: false, error: "Image must be 5MB or smaller." };
  }

  try {
    const { supabase } = await requireAdmin();
    const extension = normalizeUploadFileName(file.name).split(".").pop() || "jpg";
    const imageId = crypto.randomUUID();
    const path = `projects/${storageKey}/${imageId}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storageClient = createServiceClient() ?? supabase;

    const { error: uploadError } = await storageClient.storage
      .from(ASSETS_BUCKET)
      .upload(path, fileBuffer, {
        cacheControl: "3600",
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      const message = uploadError.message.includes("row-level security")
        ? "Storage access denied. Add SUPABASE_SERVICE_ROLE_KEY to .env.local or run the storage policies in supabase/schema.sql."
        : uploadError.message;

      return { success: false, error: message };
    }

    const {
      data: { publicUrl },
    } = storageClient.storage.from(ASSETS_BUCKET).getPublicUrl(path);

    return {
      success: true,
      image: {
        id: imageId,
        url: publicUrl,
        storagePath: path,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not upload image.",
    };
  }
}

export async function deleteProjectImage(
  storagePath: string,
): Promise<ProjectActionResult> {
  const normalized = storagePath.trim();

  if (!normalized) {
    return { success: true, id: "" };
  }

  try {
    const { supabase } = await requireAdmin();
    const storageClient = createServiceClient() ?? supabase;

    const { error } = await storageClient.storage
      .from(ASSETS_BUCKET)
      .remove([normalized]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: "" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete image.",
    };
  }
}

export { projectDetailToForm };