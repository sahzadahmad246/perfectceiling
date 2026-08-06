"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import {
  catalogueItemToForm,
  type CatalogueFormInput,
  type CatalogueImageItem,
} from "@/lib/catalogue";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getImageMimeType,
  isUploadFile,
  MAX_UPLOAD_IMAGE_SIZE,
  normalizeUploadFileName,
} from "@/lib/upload-image";

const CATALOGUE_TABLE = "catalogue_images";
const ASSETS_BUCKET = "business-assets";

export type CatalogueActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type CatalogueBatchActionResult =
  | { success: true; ids: string[] }
  | { success: false; error: string };

export type CatalogueUploadResult =
  | {
      success: true;
      image: { url: string; storagePath: string };
    }
  | { success: false; error: string };

type CatalogueRow = {
  id: string;
  image_url: string;
  storage_path: string;
  caption: string;
  alt_text: string | null;
  seo_description: string | null;
  published: boolean;
  sort_order: number | null;
};

type ValidatedCatalogueData = {
  image_url: string;
  storage_path: string;
  caption: string;
  alt_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  sort_order: number;
};

function parseSortOrder(value: string) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCatalogueItem(row: CatalogueRow): CatalogueImageItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    caption: row.caption,
    altText: row.alt_text,
    seoDescription: row.seo_description,
    published: row.published,
    sortOrder: row.sort_order ?? 0,
  };
}

function validateCatalogueInput(
  input: CatalogueFormInput,
): { error: string } | { data: ValidatedCatalogueData } {
  const imageUrl = input.imageUrl.trim();
  const storagePath = input.storagePath.trim();
  const caption = input.caption.trim();
  const altText = input.altText.trim();
  const seoDescription = input.seoDescription.trim();
  const sortOrder = parseSortOrder(input.sortOrder);

  if (!imageUrl) {
    return { error: "Please upload an image." };
  }

  if (!caption) {
    return { error: "Caption is required." };
  }

  return {
    data: {
      image_url: imageUrl,
      storage_path: storagePath,
      caption,
      alt_text: altText || null,
      // Caption is the SEO title; keep column in sync for older readers.
      seo_title: caption,
      seo_description: seoDescription || null,
      published: input.published,
      sort_order: sortOrder,
    },
  };
}

const SELECT_COLUMNS =
  "id, image_url, storage_path, caption, alt_text, seo_description, published, sort_order";

export async function listCatalogueImages(): Promise<CatalogueImageItem[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from(CATALOGUE_TABLE)
    .select(SELECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapCatalogueItem(row as CatalogueRow));
}

export async function getCatalogueImageById(
  id: string,
): Promise<CatalogueImageItem | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from(CATALOGUE_TABLE)
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapCatalogueItem(data as CatalogueRow) : null;
}

export async function createCatalogueImage(
  input: CatalogueFormInput,
): Promise<CatalogueActionResult> {
  const batch = await createCatalogueImages([input]);

  if (!batch.success) {
    return { success: false, error: batch.error };
  }

  return { success: true, id: batch.ids[0] ?? "" };
}

export async function createCatalogueImages(
  inputs: CatalogueFormInput[],
): Promise<CatalogueBatchActionResult> {
  if (!inputs.length) {
    return { success: false, error: "Add at least one image." };
  }

  const { supabase, user } = await requireAdmin();
  const rows: ValidatedCatalogueData[] = [];

  for (let index = 0; index < inputs.length; index += 1) {
    const validated = validateCatalogueInput(inputs[index]);

    if ("error" in validated) {
      return {
        success: false,
        error: `Image ${index + 1}: ${validated.error}`,
      };
    }

    rows.push(validated.data);
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from(CATALOGUE_TABLE)
    .insert(
      rows.map((row) => ({
        ...row,
        created_by: user.id,
        updated_at: now,
      })),
    )
    .select("id");

  if (error || !data?.length) {
    return {
      success: false,
      error: error?.message ?? "Could not save images.",
    };
  }

  revalidatePath("/admin/catalogue");
  revalidatePath("/catalogue");
  revalidatePath("/");

  return { success: true, ids: data.map((row) => row.id as string) };
}

export async function updateCatalogueImage(
  id: string,
  input: CatalogueFormInput,
): Promise<CatalogueActionResult> {
  const { supabase } = await requireAdmin();
  const validated = validateCatalogueInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  const { data, error } = await supabase
    .from(CATALOGUE_TABLE)
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
      error: error?.message ?? "Could not update image.",
    };
  }

  revalidatePath("/admin/catalogue");
  revalidatePath(`/admin/catalogue/${id}`);
  revalidatePath("/catalogue");
  revalidatePath(`/catalogue/${id}`);
  revalidatePath("/");

  return { success: true, id: data.id };
}

export async function deleteCatalogueImage(
  id: string,
): Promise<CatalogueActionResult> {
  const { supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from(CATALOGUE_TABLE)
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const storagePath =
    typeof existing?.storage_path === "string" ? existing.storage_path.trim() : "";

  const { error } = await supabase.from(CATALOGUE_TABLE).delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (storagePath) {
    try {
      const storageClient = createServiceClient() ?? supabase;
      await storageClient.storage.from(ASSETS_BUCKET).remove([storagePath]);
    } catch {
      // Row is gone; storage cleanup is best-effort.
    }
  }

  revalidatePath("/admin/catalogue");
  revalidatePath(`/admin/catalogue/${id}`);
  revalidatePath("/catalogue");
  revalidatePath(`/catalogue/${id}`);
  revalidatePath("/");

  return { success: true, id };
}

export async function uploadCatalogueImage(
  formData: FormData,
): Promise<CatalogueUploadResult> {
  const file = formData.get("file");

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
    const extension =
      normalizeUploadFileName(file.name).split(".").pop() || "jpg";
    const imageId = crypto.randomUUID();
    const path = `catalogue/${imageId}.${extension}`;
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

export { catalogueItemToForm };
