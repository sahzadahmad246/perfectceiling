"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/admin";

const SETTINGS_TABLE = "business_settings";
const LOGO_BUCKET = "business-assets";

const editableFields = [
  "business_name",
  "phone",
  "whatsapp",
  "email",
  "address",
  "city",
  "service_areas",
  "gst_number",
  "bank_details",
  "default_quotation_terms",
  "default_invoice_terms",
] as const;

type EditableField = (typeof editableFields)[number];

export type SettingsActionResult =
  | { success: true }
  | { success: false; error: string };

function isEditableField(
  value: FormDataEntryValue | null,
): value is EditableField {
  return (
    typeof value === "string" &&
    editableFields.includes(value as EditableField)
  );
}

function normalizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "size" in value &&
    typeof value.size === "number"
  );
}

function getImageMimeType(file: File) {
  if (file.type.startsWith("image/")) {
    return file.type;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return null;
  }
}

export async function ensureBusinessSettings() {
  const { supabase, user } = await requireAdmin();
  const { data: existing, error } = await supabase
    .from(SETTINGS_TABLE)
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (existing) {
    return existing;
  }

  const { data, error: insertError } = await supabase
    .from(SETTINGS_TABLE)
    .insert({
      business_name: "Perfect Ceiling",
      updated_by: user.id,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return data;
}

export async function updateBusinessSetting(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  const field = formData.get("field");
  const value = formData.get("value");

  if (!isEditableField(field) || typeof value !== "string") {
    return { success: false, error: "Invalid field." };
  }

  try {
    const { supabase, user } = await requireAdmin();
    const settings = await ensureBusinessSettings();

    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .update({
        [field]: value.trim() || null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not save setting.",
    };
  }
}

export async function uploadBusinessLogo(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  const file = formData.get("logo");

  if (!isUploadFile(file) || file.size === 0) {
    return { success: false, error: "Please select a logo file." };
  }

  const mimeType = getImageMimeType(file);

  if (!mimeType) {
    return {
      success: false,
      error: "Use PNG, JPG, WEBP, or SVG.",
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Logo must be 5MB or smaller." };
  }

  try {
    const { supabase, user } = await requireAdmin();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        error: "Your session expired. Please sign in again.",
      };
    }

    const settings = await ensureBusinessSettings();
    const extension = normalizeFileName(file.name).split(".").pop() || "png";
    const path = `logos/${settings.id}-${Date.now()}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storageClient = createServiceClient() ?? supabase;

    const { error: uploadError } = await storageClient.storage
      .from(LOGO_BUCKET)
      .upload(path, fileBuffer, {
        cacheControl: "3600",
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      const message = uploadError.message.includes("row-level security")
        ? "Storage access denied. Add SUPABASE_SERVICE_ROLE_KEY to .env.local or run the storage policies in supabase/schema.sql."
        : uploadError.message;

      return { success: false, error: message };
    }

    const {
      data: { publicUrl },
    } = storageClient.storage.from(LOGO_BUCKET).getPublicUrl(path);

    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .update({
        logo_url: publicUrl,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settings.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not upload logo.",
    };
  }
}