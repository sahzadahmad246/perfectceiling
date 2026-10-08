"use server";
import sharp from "sharp";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import type {
  CatalogueFormInput,
  CatalogueGroupImage,
  CatalogueGroupItem,
} from "@/lib/catalogue";
import { normalizeThumbnailFlags } from "@/lib/catalogue";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getImageMimeType,
  isUploadFile,
  MAX_UPLOAD_IMAGE_SIZE,
  normalizeUploadFileName,
  slugifyUploadStem,
} from "@/lib/upload-image";

const GROUPS_TABLE = "catalogue_groups";
const IMAGES_TABLE = "catalogue_group_images";
const ASSETS_BUCKET = "business-assets";

export type CatalogueActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type CatalogueUploadResult =
  | {
      success: true;
      image: { url: string; storagePath: string; width?: number; height?: number };
    }
  | { success: false; error: string };

type GroupRow = {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  sort_order: number | null;
};

type ImageRow = {
  width?: number | null;
  height?: number | null;
  id: string;
  group_id: string;
  image_url: string;
  storage_path: string;
  subtitle: string | null;
  is_thumbnail: boolean | null;
  sort_order: number | null;
  view_count?: number | null;
};

type ValidatedGroupData = {
  title: string;
  description: string | null;
  published: boolean;
  sort_order: number;
};

type ValidatedImageData = {
  width?: number | null;
  height?: number | null;
  id?: string;
  image_url: string;
  storage_path: string;
  subtitle: string | null;
  is_thumbnail: boolean;
  sort_order: number;
};

function parseSortOrder(value: string) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapImage(row: ImageRow): CatalogueGroupImage {
  return {
    id: row.id,
    imageUrl: row.image_url,
    width: row.width,
    height: row.height,
    storagePath: row.storage_path,
    subtitle: row.subtitle,
    isThumbnail: Boolean(row.is_thumbnail),
    sortOrder: row.sort_order ?? 0,
    viewCount: row.view_count ?? 0,
  };
}

function mapGroup(
  row: GroupRow,
  images: CatalogueGroupImage[],
): CatalogueGroupItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    published: row.published,
    sortOrder: row.sort_order ?? 0,
    images,
  };
}

function validateGroupInput(
  input: CatalogueFormInput,
): { error: string } | { group: ValidatedGroupData; images: ValidatedImageData[] } {
  const title = input.title.trim();
  const description = input.description.trim();
  const sortOrder = parseSortOrder(input.sortOrder);

  if (!title) {
    return { error: "Title is required." };
  }

  if (!input.images.length) {
    return { error: "Add at least one image." };
  }

  const normalized = normalizeThumbnailFlags(input.images);
  const images: ValidatedImageData[] = [];
  let thumbnailCount = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    const image = normalized[index];
    const imageUrl = image.imageUrl.trim();
    const storagePath = image.storagePath.trim();
    const subtitle = image.subtitle.trim();

    if (!imageUrl) {
      return { error: `Image ${index + 1}: please add a photo.` };
    }

    if (image.isThumbnail) {
      thumbnailCount += 1;
    }

    images.push({
      id: image.id?.trim() || undefined,
      image_url: imageUrl,
      width: image.width,
      height: image.height,
      storage_path: storagePath,
      subtitle: subtitle || null,
      is_thumbnail: Boolean(image.isThumbnail),
      sort_order: parseSortOrder(image.sortOrder) || index,
    });
  }

  if (thumbnailCount !== 1) {
    // Keep first as sole thumbnail if flags were messy.
    images.forEach((image, index) => {
      image.is_thumbnail = index === 0;
    });
  }

  return {
    group: {
      title,
      description: description || null,
      published: input.published,
      sort_order: sortOrder,
    },
    images,
  };
}

function revalidateCatalogue(id?: string) {
  revalidatePath("/admin/catalogue");
  revalidatePath("/catalogue");
  revalidatePath("/");

  if (id) {
    revalidatePath(`/admin/catalogue/${id}`);
    revalidatePath(`/catalogue/${id}`);
  }
}

async function removeStoragePaths(paths: string[]) {
  const cleaned = paths.map((path) => path.trim()).filter(Boolean);

  if (!cleaned.length) {
    return;
  }

  try {
    const { supabase } = await requireAdmin();
    const storageClient = createServiceClient() ?? supabase;
    await storageClient.storage.from(ASSETS_BUCKET).remove(cleaned);
  } catch {
    // Storage cleanup is best-effort.
  }
}

export async function listCatalogueGroups(): Promise<CatalogueGroupItem[]> {
  const { supabase } = await requireAdmin();

  const { data: groups, error: groupsError } = await supabase
    .from(GROUPS_TABLE)
    .select("id, title, description, published, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (groupsError) {
    throw new Error(groupsError.message);
  }

  if (!groups?.length) {
    return [];
  }

  const groupIds = groups.map((row) => row.id as string);

  const { data: images, error: imagesError } = await supabase
    .from(IMAGES_TABLE)
    .select(
      "*",
    )
    .in("group_id", groupIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (imagesError) {
    throw new Error(imagesError.message);
  }

  const imagesByGroup = new Map<string, CatalogueGroupImage[]>();

  for (const row of (images ?? []) as ImageRow[]) {
    const list = imagesByGroup.get(row.group_id) ?? [];
    list.push(mapImage(row));
    imagesByGroup.set(row.group_id, list);
  }

  return (groups as GroupRow[]).map((row) =>
    mapGroup(row, imagesByGroup.get(row.id) ?? []),
  );
}

export async function getCatalogueGroupById(
  id: string,
): Promise<CatalogueGroupItem | null> {
  const { supabase } = await requireAdmin();

  const { data: group, error: groupError } = await supabase
    .from(GROUPS_TABLE)
    .select("id, title, description, published, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (groupError) {
    throw new Error(groupError.message);
  }

  if (!group) {
    return null;
  }

  const { data: images, error: imagesError } = await supabase
    .from(IMAGES_TABLE)
    .select(
      "*",
    )
    .eq("group_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (imagesError) {
    throw new Error(imagesError.message);
  }

  return mapGroup(
    group as GroupRow,
    ((images ?? []) as ImageRow[]).map(mapImage),
  );
}

export async function createCatalogueGroup(
  input: CatalogueFormInput,
): Promise<CatalogueActionResult> {
  const validated = validateGroupInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  const { supabase, user } = await requireAdmin();
  const now = new Date().toISOString();

  const { data: group, error: groupError } = await supabase
    .from(GROUPS_TABLE)
    .insert({
      ...validated.group,
      created_by: user.id,
      updated_at: now,
    })
    .select("id")
    .single();

  if (groupError || !group) {
    return {
      success: false,
      error: groupError?.message ?? "Could not save group.",
    };
  }

  const groupId = group.id as string;

  const { error: imagesError } = await supabase.from(IMAGES_TABLE).insert(
    validated.images.map((image, index) => ({
      group_id: groupId,
      image_url: image.image_url,
      ...(image.width && image.height ? { width: image.width, height: image.height } : {}),
      storage_path: image.storage_path,
      subtitle: image.subtitle,
      is_thumbnail: image.is_thumbnail,
      sort_order: image.sort_order || index,
    })),
  );

  if (imagesError) {
    await supabase.from(GROUPS_TABLE).delete().eq("id", groupId);
    return { success: false, error: imagesError.message };
  }

  revalidateCatalogue(groupId);
  return { success: true, id: groupId };
}

export async function updateCatalogueGroup(
  id: string,
  input: CatalogueFormInput,
): Promise<CatalogueActionResult> {
  const validated = validateGroupInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  const { supabase } = await requireAdmin();

  const { data: existingImages, error: existingError } = await supabase
    .from(IMAGES_TABLE)
    .select("id, storage_path")
    .eq("group_id", id);

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  const existingById = new Map(
    (existingImages ?? []).map((row) => [
      row.id as string,
      typeof row.storage_path === "string" ? row.storage_path : "",
    ]),
  );

  const keptIds = new Set(
    validated.images
      .map((image) => image.id)
      .filter((imageId): imageId is string => Boolean(imageId)),
  );

  const removedPaths: string[] = [];

  for (const [imageId, storagePath] of existingById) {
    if (!keptIds.has(imageId)) {
      removedPaths.push(storagePath);
    }
  }

  const { error: groupError } = await supabase
    .from(GROUPS_TABLE)
    .update({
      ...validated.group,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (groupError) {
    return { success: false, error: groupError.message };
  }

  const toDelete = [...existingById.keys()].filter(
    (imageId) => !keptIds.has(imageId),
  );

  if (toDelete.length) {
    const { error: deleteError } = await supabase
      .from(IMAGES_TABLE)
      .delete()
      .in("id", toDelete);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
  }

  // Clear all thumbnails first so the unique partial index never conflicts mid-update.
  await supabase
    .from(IMAGES_TABLE)
    .update({ is_thumbnail: false })
    .eq("group_id", id);

  for (let index = 0; index < validated.images.length; index += 1) {
    const image = validated.images[index];
    const sortOrder = image.sort_order || index;

    if (image.id && existingById.has(image.id)) {
      const previousPath = existingById.get(image.id) ?? "";
      const { error: updateError } = await supabase
        .from(IMAGES_TABLE)
        .update({
          image_url: image.image_url,
      ...(image.width && image.height ? { width: image.width, height: image.height } : {}),
          storage_path: image.storage_path,
          subtitle: image.subtitle,
          is_thumbnail: image.is_thumbnail,
          sort_order: sortOrder,
        })
        .eq("id", image.id)
        .eq("group_id", id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // If the photo was replaced, drop the old file.
      if (
        previousPath &&
        image.storage_path &&
        previousPath !== image.storage_path
      ) {
        removedPaths.push(previousPath);
      }
    } else {
      const { error: insertError } = await supabase.from(IMAGES_TABLE).insert({
        group_id: id,
        image_url: image.image_url,
      ...(image.width && image.height ? { width: image.width, height: image.height } : {}),
        storage_path: image.storage_path,
        subtitle: image.subtitle,
        is_thumbnail: image.is_thumbnail,
        sort_order: sortOrder,
      });

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }
  }

  await removeStoragePaths(removedPaths);
  revalidateCatalogue(id);
  return { success: true, id };
}

export async function deleteCatalogueGroup(
  id: string,
): Promise<CatalogueActionResult> {
  const { supabase } = await requireAdmin();

  const { data: images } = await supabase
    .from(IMAGES_TABLE)
    .select("storage_path")
    .eq("group_id", id);

  const storagePaths = (images ?? [])
    .map((row) =>
      typeof row.storage_path === "string" ? row.storage_path.trim() : "",
    )
    .filter(Boolean);

  const { error } = await supabase.from(GROUPS_TABLE).delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  await removeStoragePaths(storagePaths);
  revalidateCatalogue(id);
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
    const titleHint = String(formData.get("title") ?? "");
    const subtitleHint = String(formData.get("subtitle") ?? "");
    const seoStem =
      slugifyUploadStem(subtitleHint || titleHint) || "ceiling-design";
    const path = `catalogue/${seoStem}-${imageId.slice(0, 8)}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(fileBuffer).metadata();
    const rotated = metadata.orientation && metadata.orientation >= 5;
    const width = rotated ? metadata.height : metadata.width;
    const height = rotated ? metadata.width : metadata.height;
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
        width,
        height,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not upload image.",
    };
  }
}

/** @deprecated Use listCatalogueGroups */
export async function listCatalogueImages() {
  return listCatalogueGroups();
}

/** @deprecated Use getCatalogueGroupById */
export async function getCatalogueImageById(id: string) {
  return getCatalogueGroupById(id);
}

/** @deprecated Use deleteCatalogueGroup */
export async function deleteCatalogueImage(id: string) {
  return deleteCatalogueGroup(id);
}
