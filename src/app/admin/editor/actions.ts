"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getImageMimeType,
  isUploadFile,
  MAX_UPLOAD_IMAGE_SIZE,
  normalizeUploadFileName,
} from "@/lib/upload-image";

const ASSETS_BUCKET = "business-assets";

export type EditorImageUploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadEditorImage(
  formData: FormData,
): Promise<EditorImageUploadResult> {
  const file = formData.get("file");

  if (!isUploadFile(file) || file.size === 0) {
    return { success: false, error: "Please select an image file." };
  }

  const mimeType = getImageMimeType(file);

  if (!mimeType) {
    return { success: false, error: "Use PNG, JPG, WEBP, or GIF." };
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    return { success: false, error: "Image must be 5MB or smaller." };
  }

  try {
    const { supabase } = await requireAdmin();
    const extension = normalizeUploadFileName(file.name).split(".").pop() || "jpg";
    const imageId = crypto.randomUUID();
    const path = `editor-content/${imageId}.${extension}`;
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

    return { success: true, url: publicUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not upload image.",
    };
  }
}