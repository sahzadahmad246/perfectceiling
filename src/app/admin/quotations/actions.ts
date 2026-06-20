"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { validateQuotationCustomer } from "@/lib/customer-validation";
import {
  calculateDiscountAmount,
  calculateGrandTotal,
  calculateLineItemAmount,
  hasDraftContent,
  parseNumber,
  QUOTATION_ADMIN_STATUSES,
  QUOTATION_AUTO_EXPIRE_DAYS,
  QUOTATION_AUTO_EXPIRE_STATUSES,
  quotationDetailToDraft,
  type CreateQuotationInput,
  type QuotationDetail,
  type QuotationDraftListItem,
  type QuotationLineItemDraft,
  type QuotationLineItemImageDraft,
  type QuotationListItem,
} from "@/lib/quotations";
import { getNextDocumentNumber } from "@/lib/document-numbers";
import { createServiceClient } from "@/lib/supabase/admin";

const ASSETS_BUCKET = "business-assets";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export type QuotationImageActionResult =
  | { success: true; image: QuotationLineItemImageDraft }
  | { success: false; error: string };

export type QuotationImageDeleteResult =
  | { success: true }
  | { success: false; error: string };

export type QuotationActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type QuotationDeleteResult =
  | { success: true }
  | { success: false; error: string };

export type QuotationDefaults = {
  quotationTerms: string;
  bankDetails: string;
};

async function generateQuotationNumber(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
) {
  const { data, error } = await supabase
    .from("quotations")
    .select("quotation_number")
    .neq("status", "draft");

  if (error) {
    throw new Error(error.message);
  }

  return getNextDocumentNumber(
    (data ?? []).map((row) => row.quotation_number),
    "Q",
  );
}

async function generateDraftQuotationNumber(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
) {
  const { data, error } = await supabase
    .from("quotations")
    .select("quotation_number")
    .eq("status", "draft");

  if (error) {
    throw new Error(error.message);
  }

  return getNextDocumentNumber(
    (data ?? []).map((row) => row.quotation_number),
    "DRAFT",
  );
}

function normalizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-");
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function"
  );
}

function getImageMimeType(file: File) {
  if (file.type.startsWith("image/")) {
    return file.type;
  }

  const extension = normalizeFileName(file.name).split(".").pop();

  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return null;
  }
}

function mapStoredImages(
  images: Array<{
    id: string;
    image_url: string;
    storage_path: string;
    description: string | null;
    sort_order: number;
  }> | null,
): QuotationLineItemImageDraft[] {
  return (images ?? [])
    .slice()
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((image) => ({
      id: image.id,
      url: image.image_url,
      storagePath: image.storage_path,
      description: image.description ?? "",
    }));
}

function buildItemRows(quotationId: string, items: QuotationLineItemDraft[]) {
  const validItems = items.filter((item) => item.name.trim());

  return validItems.map((item, index) => {
    const amount = calculateLineItemAmount(item);
    const unitType = item.isLumpSum ? "lump_sum" : item.unitType;

    return {
      id: item.id,
      quotation_id: quotationId,
      description: item.name.trim(),
      unit_type: unitType,
      quantity: item.isLumpSum ? 1 : parseNumber(item.quantity),
      rate: item.isLumpSum ? amount : parseNumber(item.rate),
      amount,
      notes:
        [item.description.trim(), item.notes.trim()]
          .filter(Boolean)
          .join("\n") || null,
      sort_order: index,
    };
  });
}

function buildImageRows(items: QuotationLineItemDraft[]) {
  const rows: Array<{
    id: string;
    quotation_item_id: string;
    image_url: string;
    storage_path: string;
    description: string | null;
    sort_order: number;
  }> = [];

  for (const item of items) {
    if (!item.name.trim()) {
      continue;
    }

    item.images.forEach((image, index) => {
      if (!image.url.trim() || !image.storagePath.trim()) {
        return;
      }

      rows.push({
        id: image.id,
        quotation_item_id: item.id,
        image_url: image.url,
        storage_path: image.storagePath,
        description: image.description.trim() || null,
        sort_order: index,
      });
    });
  }

  return rows;
}

async function insertItemImages(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  items: QuotationLineItemDraft[],
) {
  const imageRows = buildImageRows(items);

  if (imageRows.length === 0) {
    return null;
  }

  const { error } = await supabase.from("quotation_item_images").insert(imageRows);

  return error;
}

async function saveQuotationItems(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  quotationId: string,
  items: QuotationLineItemDraft[],
) {
  const itemRows = buildItemRows(quotationId, items);

  if (itemRows.length === 0) {
    return null;
  }

  const { error: itemsError } = await supabase
    .from("quotation_items")
    .insert(itemRows);

  if (itemsError) {
    return itemsError;
  }

  return insertItemImages(supabase, items);
}

export async function uploadQuotationItemImage(
  formData: FormData,
): Promise<QuotationImageActionResult> {
  const file = formData.get("file");
  const itemId = String(formData.get("itemId") ?? "").trim();

  if (!itemId) {
    return { success: false, error: "Item reference is missing." };
  }

  if (!isUploadFile(file) || file.size === 0) {
    return { success: false, error: "Please select an image file." };
  }

  const mimeType = getImageMimeType(file);

  if (!mimeType) {
    return { success: false, error: "Use PNG, JPG, or WEBP." };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { success: false, error: "Image must be 5MB or smaller." };
  }

  try {
    const { supabase } = await requireAdmin();
    const extension = normalizeFileName(file.name).split(".").pop() || "jpg";
    const imageId = crypto.randomUUID();
    const path = `quotation-items/${itemId}/${imageId}.${extension}`;
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
        description: "",
        fileName: file.name,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not upload image.",
    };
  }
}

export async function deleteQuotationItemImage(
  storagePath: string,
): Promise<QuotationImageDeleteResult> {
  const normalizedPath = storagePath.trim();

  if (!normalizedPath) {
    return { success: false, error: "Image path is missing." };
  }

  try {
    const { supabase } = await requireAdmin();
    const storageClient = createServiceClient() ?? supabase;

    const { error } = await storageClient.storage
      .from(ASSETS_BUCKET)
      .remove([normalizedPath]);

    if (error) {
      const message = error.message.includes("row-level security")
        ? "Storage access denied. Add SUPABASE_SERVICE_ROLE_KEY to .env.local or run the storage policies in supabase/schema.sql."
        : error.message;

      return { success: false, error: message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not remove image.",
    };
  }
}

function calculateWorkTotals(work: CreateQuotationInput["work"], items: QuotationLineItemDraft[]) {
  const validItems = items.filter((item) => item.name.trim());
  const subtotal = validItems.reduce(
    (sum, item) => sum + calculateLineItemAmount(item),
    0,
  );
  const discountType =
    work.discountType === "percentage" ? "percentage" : "fixed";
  const discountValue = Math.max(0, parseNumber(work.discount));
  const grandTotal = calculateGrandTotal(subtotal, work.discount, discountType);

  return { validItems, subtotal, discountType, discountValue, grandTotal };
}

async function expireStaleQuotations(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - QUOTATION_AUTO_EXPIRE_DAYS);

  const { error } = await supabase
    .from("quotations")
    .update({
      status: "expired",
      updated_at: new Date().toISOString(),
    })
    .in("status", [...QUOTATION_AUTO_EXPIRE_STATUSES])
    .lt("updated_at", cutoff.toISOString());

  return error;
}

export async function getQuotationDefaults(): Promise<QuotationDefaults> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("business_settings")
    .select("default_quotation_terms, bank_details")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    quotationTerms: data?.default_quotation_terms?.trim() ?? "",
    bankDetails: data?.bank_details?.trim() ?? "",
  };
}

export async function listQuotations(): Promise<QuotationListItem[]> {
  const { supabase } = await requireAdmin();

  const expireError = await expireStaleQuotations(supabase);

  if (expireError) {
    throw new Error(expireError.message);
  }

  const { data, error } = await supabase
    .from("quotations")
    .select(
      `
      id,
      quotation_number,
      work_title,
      grand_total,
      status,
      date,
      created_at,
      updated_at,
      customers (
        name,
        phone,
        address,
        city
      )
    `,
    )
    .neq("status", "draft")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const customer = Array.isArray(row.customers)
      ? row.customers[0]
      : row.customers;

    const customerAddress = [customer?.address, customer?.city]
      .filter((part) => part?.trim())
      .join(", ");

    return {
      id: row.id,
      quotationNumber: row.quotation_number,
      workTitle: row.work_title,
      grandTotal: Number(row.grand_total),
      status: row.status,
      date: row.date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      customerName: customer?.name ?? "Unknown customer",
      customerPhone: customer?.phone ?? "",
      customerAddress,
    };
  });
}

export async function getQuotationById(id: string): Promise<QuotationDetail | null> {
  const { supabase } = await requireAdmin();

  const expireError = await expireStaleQuotations(supabase);

  if (expireError) {
    throw new Error(expireError.message);
  }

  const { data, error } = await supabase
    .from("quotations")
    .select(
      `
      id,
      quotation_number,
      work_title,
      date,
      valid_until,
      subtotal,
      discount_type,
      discount_value,
      tax_value,
      grand_total,
      terms,
      status,
      customers (
        name,
        phone,
        whatsapp,
        email,
        address,
        city,
        notes
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("quotation_items")
    .select(
      `
      id,
      description,
      unit_type,
      quantity,
      rate,
      amount,
      notes,
      sort_order,
      quotation_item_images (
        id,
        image_url,
        storage_path,
        description,
        sort_order
      )
    `,
    )
    .eq("quotation_id", id)
    .order("sort_order", { ascending: true });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const customer = Array.isArray(data.customers)
    ? data.customers[0]
    : data.customers;

  return {
    id: data.id,
    quotationNumber: data.quotation_number,
    workTitle: data.work_title,
    date: data.date,
    validUntil: data.valid_until,
    subtotal: Number(data.subtotal),
    discountType: data.discount_type,
    discountValue: Number(data.discount_value),
    taxValue: Number(data.tax_value),
    grandTotal: Number(data.grand_total),
    terms: data.terms,
    status: data.status,
    customer: customer
      ? {
          name: customer.name,
          phone: customer.phone,
          whatsapp: customer.whatsapp,
          email: customer.email,
          address: customer.address,
          city: customer.city,
          notes: customer.notes,
        }
      : null,
    items: (items ?? []).map((item) => {
      const itemImages = Array.isArray(item.quotation_item_images)
        ? item.quotation_item_images
        : item.quotation_item_images
          ? [item.quotation_item_images]
          : [];

      return {
        id: item.id,
        description: item.description,
        unitType: item.unit_type,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        notes: item.notes,
        sortOrder: item.sort_order,
        images: mapStoredImages(itemImages),
      };
    }),
  };
}

function validateQuotationInput(input: CreateQuotationInput) {
  const customerValidation = validateQuotationCustomer(input.customer);

  if (!customerValidation.valid) {
    const firstError =
      customerValidation.errors.name ??
      customerValidation.errors.phone ??
      customerValidation.errors.address ??
      "Customer details are incomplete.";

    return { success: false as const, error: firstError };
  }

  const customerName = input.customer.name.trim();
  const customerPhone = customerValidation.formattedPhone!;
  const customerAddress = input.customer.address.trim();

  const validItems = input.work.items.filter((item) => item.name.trim());

  if (validItems.length === 0) {
    return { success: false as const, error: "Add at least one work item." };
  }

  for (const item of validItems) {
    const amount = calculateLineItemAmount(item);

    if (amount <= 0) {
      return {
        success: false as const,
        error: `Item "${item.name.trim()}" needs a valid total amount.`,
      };
    }

    if (!item.isLumpSum && (!parseNumber(item.quantity) || !parseNumber(item.rate))) {
      return {
        success: false as const,
        error: `Item "${item.name.trim()}" needs area and rate, or use lump sum.`,
      };
    }
  }

  const discountValidation = validateWorkDiscount(input.work, validItems);

  if (!discountValidation.valid) {
    return { success: false as const, error: discountValidation.error };
  }

  return {
    success: true as const,
    validItems,
    customerName,
    customerPhone,
    customerAddress,
  };
}

function validateWorkDiscount(
  work: CreateQuotationInput["work"],
  validItems: CreateQuotationInput["work"]["items"],
) {
  const subtotal = validItems.reduce(
    (sum, item) => sum + calculateLineItemAmount(item),
    0,
  );
  const discountType =
    work.discountType === "percentage" ? "percentage" : "fixed";
  const discountInput = parseNumber(work.discount);

  if (discountInput <= 0) {
    return { valid: true as const };
  }

  const discountAmount = calculateDiscountAmount(
    subtotal,
    discountType,
    work.discount,
  );

  if (discountAmount <= 0) {
    return {
      valid: false as const,
      error: "Discount must be greater than 0.",
    };
  }

  if (discountAmount > subtotal) {
    return {
      valid: false as const,
      error: "Discount cannot be more than the subtotal.",
    };
  }

  if (discountType === "percentage" && discountInput > 100) {
    return {
      valid: false as const,
      error: "Percentage discount cannot be more than 100.",
    };
  }

  return { valid: true as const };
}

export async function listQuotationDrafts(): Promise<QuotationDraftListItem[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("quotations")
    .select(
      `
      id,
      work_title,
      updated_at,
      customers (
        name
      ),
      quotation_items (
        id
      )
    `,
    )
    .eq("status", "draft")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const customer = Array.isArray(row.customers)
      ? row.customers[0]
      : row.customers;
    const items = Array.isArray(row.quotation_items)
      ? row.quotation_items
      : [];

    return {
      id: row.id,
      label: customer?.name?.trim() || "Untitled draft",
      workTitle: row.work_title,
      itemCount: items.length,
      updatedAt: row.updated_at,
    };
  });
}

export async function saveQuotationDraft(
  draftId: string | null,
  input: CreateQuotationInput,
): Promise<QuotationActionResult> {
  const defaults = await getQuotationDefaults();

  if (
    !hasDraftContent(input, {
      defaultQuotationTerms: defaults.quotationTerms,
    })
  ) {
    return { success: false, error: "Nothing to save yet." };
  }

  try {
    const { supabase, user } = await requireAdmin();
    const { validItems, subtotal, discountType, discountValue, grandTotal } =
      calculateWorkTotals(input.work, input.work.items);
    const customerName = input.customer.name.trim() || "Draft customer";
    const customerPhone = input.customer.phone.trim() || "0000000000";

    if (draftId) {
      const { data: existing, error: existingError } = await supabase
        .from("quotations")
        .select("id, customer_id, status")
        .eq("id", draftId)
        .maybeSingle();

      if (existingError) {
        return { success: false, error: existingError.message };
      }

      if (!existing || existing.status !== "draft") {
        return { success: false, error: "Draft not found." };
      }

      let customerId = existing.customer_id;

      if (customerId) {
        await supabase
          .from("customers")
          .update({
            name: customerName,
            phone: customerPhone,
            whatsapp: input.customer.whatsapp.trim() || null,
            email: input.customer.email.trim() || null,
            address: input.customer.address.trim() || null,
            city: input.customer.city.trim() || null,
            notes: input.customer.notes.trim() || null,
          })
          .eq("id", customerId);
      } else {
        const { data: customer } = await supabase
          .from("customers")
          .insert({
            name: customerName,
            phone: customerPhone,
            whatsapp: input.customer.whatsapp.trim() || null,
            email: input.customer.email.trim() || null,
            address: input.customer.address.trim() || null,
            city: input.customer.city.trim() || null,
            notes: input.customer.notes.trim() || null,
            created_by: user.id,
          })
          .select("id")
          .single();

        customerId = customer?.id ?? null;
      }

      const { error: quotationError } = await supabase
        .from("quotations")
        .update({
          customer_id: customerId,
          work_title: input.work.workTitle.trim() || null,
          subtotal,
          discount_type: discountType,
          discount_value: discountValue,
          tax_value: 0,
          grand_total: grandTotal,
          terms: input.work.quotationTerms.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draftId);

      if (quotationError) {
        return { success: false, error: quotationError.message };
      }

      await supabase.from("quotation_items").delete().eq("quotation_id", draftId);

      const itemsError = await saveQuotationItems(
        supabase,
        draftId,
        input.work.items,
      );

      if (itemsError) {
        return { success: false, error: itemsError.message };
      }

      return { success: true, id: draftId };
    }

    const quotationNumber = await generateDraftQuotationNumber(supabase);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: customerName,
        phone: customerPhone,
        whatsapp: input.customer.whatsapp.trim() || null,
        email: input.customer.email.trim() || null,
        address: input.customer.address.trim() || null,
        city: input.customer.city.trim() || null,
        notes: input.customer.notes.trim() || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (customerError) {
      return { success: false, error: customerError.message };
    }

    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .insert({
        quotation_number: quotationNumber,
        customer_id: customer.id,
        work_title: input.work.workTitle.trim() || null,
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        tax_value: 0,
        grand_total: grandTotal,
        terms: input.work.quotationTerms.trim() || null,
        status: "draft",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (quotationError) {
      return { success: false, error: quotationError.message };
    }

    const itemsError = await saveQuotationItems(
      supabase,
      quotation.id,
      input.work.items,
    );

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    return { success: true, id: quotation.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not save draft.",
    };
  }
}

export async function deleteQuotationDraft(
  id: string,
): Promise<QuotationDeleteResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("quotations")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return { success: false, error: existingError.message };
    }

    if (!existing || existing.status !== "draft") {
      return { success: false, error: "Draft not found." };
    }

    const { error } = await supabase.from("quotations").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/quotations");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete draft.",
    };
  }
}

export async function getQuotationEditData(
  id: string,
): Promise<CreateQuotationInput | null> {
  const [quotation, defaults] = await Promise.all([
    getQuotationById(id),
    getQuotationDefaults(),
  ]);

  if (!quotation) {
    return null;
  }

  return quotationDetailToDraft(quotation, defaults.quotationTerms);
}

export async function createQuotation(
  input: CreateQuotationInput,
  draftId?: string | null,
): Promise<QuotationActionResult> {
  const validation = validateQuotationInput(input);

  if (!validation.success) {
    return validation;
  }

  const { validItems, customerName, customerPhone, customerAddress } = validation;

  try {
    const { supabase, user } = await requireAdmin();
    const quotationNumber = await generateQuotationNumber(supabase);
    const subtotal = validItems.reduce(
      (sum, item) => sum + calculateLineItemAmount(item),
      0,
    );
    const discountType =
      input.work.discountType === "percentage" ? "percentage" : "fixed";
    const discountValue = Math.max(0, parseNumber(input.work.discount));
    const grandTotal = calculateGrandTotal(
      subtotal,
      input.work.discount,
      discountType,
    );

    if (draftId) {
      const { data: existing, error: existingError } = await supabase
        .from("quotations")
        .select("id, customer_id, status")
        .eq("id", draftId)
        .maybeSingle();

      if (existingError) {
        return { success: false, error: existingError.message };
      }

      if (!existing || existing.status !== "draft") {
        return { success: false, error: "Draft not found." };
      }

      let customerId = existing.customer_id;

      if (customerId) {
        const { error: customerError } = await supabase
          .from("customers")
          .update({
            name: customerName,
            phone: customerPhone,
            whatsapp: input.customer.whatsapp.trim() || null,
            email: input.customer.email.trim() || null,
            address: customerAddress,
            city: input.customer.city.trim() || null,
            notes: input.customer.notes.trim() || null,
          })
          .eq("id", customerId);

        if (customerError) {
          return { success: false, error: customerError.message };
        }
      } else {
        const { data: customer, error: customerError } = await supabase
          .from("customers")
          .insert({
            name: customerName,
            phone: customerPhone,
            whatsapp: input.customer.whatsapp.trim() || null,
            email: input.customer.email.trim() || null,
            address: customerAddress,
            city: input.customer.city.trim() || null,
            notes: input.customer.notes.trim() || null,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (customerError) {
          return { success: false, error: customerError.message };
        }

        customerId = customer.id;
      }

      const { error: quotationError } = await supabase
        .from("quotations")
        .update({
          customer_id: customerId,
          quotation_number: quotationNumber,
          work_title: input.work.workTitle.trim() || null,
          subtotal,
          discount_type: discountType,
          discount_value: discountValue,
          tax_value: 0,
          grand_total: grandTotal,
          terms: input.work.quotationTerms.trim() || null,
          status: "created",
        })
        .eq("id", draftId);

      if (quotationError) {
        return { success: false, error: quotationError.message };
      }

      await supabase.from("quotation_items").delete().eq("quotation_id", draftId);

      const itemsError = await saveQuotationItems(supabase, draftId, validItems);

      if (itemsError) {
        return { success: false, error: itemsError.message };
      }

      revalidatePath("/admin/quotations");
      revalidatePath(`/admin/quotations/${draftId}`);

      return { success: true, id: draftId };
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: customerName,
        phone: customerPhone,
        whatsapp: input.customer.whatsapp.trim() || null,
        email: input.customer.email.trim() || null,
        address: customerAddress,
        city: input.customer.city.trim() || null,
        notes: input.customer.notes.trim() || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (customerError) {
      return { success: false, error: customerError.message };
    }

    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .insert({
        quotation_number: quotationNumber,
        customer_id: customer.id,
        work_title: input.work.workTitle.trim() || null,
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        tax_value: 0,
        grand_total: grandTotal,
        terms: input.work.quotationTerms.trim() || null,
        status: "created",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (quotationError) {
      return { success: false, error: quotationError.message };
    }

    const itemsError = await saveQuotationItems(
      supabase,
      quotation.id,
      validItems,
    );

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    revalidatePath("/admin/quotations");
    revalidatePath(`/admin/quotations/${quotation.id}`);

    return { success: true, id: quotation.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create quotation.",
    };
  }
}

export async function updateQuotation(
  id: string,
  input: CreateQuotationInput,
): Promise<QuotationActionResult> {
  const validation = validateQuotationInput(input);

  if (!validation.success) {
    return validation;
  }

  const { validItems, customerName, customerPhone, customerAddress } = validation;

  try {
    const { supabase } = await requireAdmin();

    const { data: existingQuotation, error: existingError } = await supabase
      .from("quotations")
      .select("id, customer_id")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return { success: false, error: existingError.message };
    }

    if (!existingQuotation) {
      return { success: false, error: "Quotation not found." };
    }

    if (existingQuotation.customer_id) {
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          name: customerName,
          phone: customerPhone,
          whatsapp: input.customer.whatsapp.trim() || null,
          email: input.customer.email.trim() || null,
          address: customerAddress,
          city: input.customer.city.trim() || null,
          notes: input.customer.notes.trim() || null,
        })
        .eq("id", existingQuotation.customer_id);

      if (customerError) {
        return { success: false, error: customerError.message };
      }
    }

    const subtotal = validItems.reduce(
      (sum, item) => sum + calculateLineItemAmount(item),
      0,
    );
    const discountType =
      input.work.discountType === "percentage" ? "percentage" : "fixed";
    const discountValue = Math.max(0, parseNumber(input.work.discount));
    const grandTotal = calculateGrandTotal(
      subtotal,
      input.work.discount,
      discountType,
    );

    const { error: quotationError } = await supabase
      .from("quotations")
      .update({
        work_title: input.work.workTitle.trim() || null,
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        tax_value: 0,
        grand_total: grandTotal,
        terms: input.work.quotationTerms.trim() || null,
      })
      .eq("id", id);

    if (quotationError) {
      return { success: false, error: quotationError.message };
    }

    const { error: deleteItemsError } = await supabase
      .from("quotation_items")
      .delete()
      .eq("quotation_id", id);

    if (deleteItemsError) {
      return { success: false, error: deleteItemsError.message };
    }

    const itemsError = await saveQuotationItems(supabase, id, validItems);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    revalidatePath("/admin/quotations");
    revalidatePath(`/admin/quotations/${id}`);

    return { success: true, id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update quotation.",
    };
  }
}

export async function updateQuotationStatus(
  id: string,
  status: string,
): Promise<QuotationActionResult> {
  if (!(QUOTATION_ADMIN_STATUSES as readonly string[]).includes(status)) {
    return { success: false, error: "Invalid quotation status." };
  }

  try {
    const { supabase } = await requireAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("quotations")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return { success: false, error: existingError.message };
    }

    if (!existing) {
      return { success: false, error: "Quotation not found." };
    }

    if (existing.status === "draft") {
      return { success: false, error: "Draft quotations cannot be updated here." };
    }

    const { error } = await supabase
      .from("quotations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/quotations");
    revalidatePath(`/admin/quotations/${id}`);

    return { success: true, id };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Could not update quotation status.",
    };
  }
}

export async function deleteQuotation(id: string): Promise<QuotationDeleteResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("quotations").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/quotations");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete quotation.",
    };
  }
}