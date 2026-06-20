"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import {
  slugifyServiceTitle,
  type ServiceDetail,
  type ServiceFormInput,
  type ServiceListItem,
  type ServiceRateUnit,
} from "@/lib/services";

const SERVICES_TABLE = "services";

export type ServiceActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

type ValidatedServiceData = {
  title: string;
  slug: string;
  short_description: string;
  content: string | null;
  starting_price: number | null;
  rate_unit: ServiceRateUnit | null;
  seo_title: string;
  seo_description: string;
  published: boolean;
  sort_order: number;
};

type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  content: string | null;
  starting_price: number | string | null;
  rate_unit: string | null;
  seo_title: string | null;
  seo_description: string | null;
  featured_image_url: string | null;
  published: boolean;
  sort_order: number;
};

function parsePrice(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed.replace(/,/g, ""));

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parseSortOrder(value: string) {
  const parsed = Number.parseInt(value.trim(), 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

function isRateUnit(value: string): value is ServiceRateUnit {
  return ["sq_ft", "running_ft", "piece", "lump_sum"].includes(value);
}

function mapServiceListItem(row: ServiceRow): ServiceListItem {
  const startingPrice =
    row.starting_price === null || row.starting_price === ""
      ? null
      : Number(row.starting_price);

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    startingPrice: Number.isFinite(startingPrice) ? startingPrice : null,
    rateUnit: isRateUnit(row.rate_unit ?? "")
      ? (row.rate_unit as ServiceRateUnit)
      : null,
    published: row.published,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title,
  };
}

function mapServiceDetail(row: ServiceRow): ServiceDetail {
  return {
    ...mapServiceListItem(row),
    content: row.content,
    seoDescription: row.seo_description,
    featuredImageUrl: row.featured_image_url,
  };
}

function validateServiceInput(
  input: ServiceFormInput,
): { error: string } | { data: ValidatedServiceData } {
  const title = input.title.trim();
  const slug = slugifyServiceTitle(input.slug || input.title);
  const shortDescription = input.shortDescription.trim();
  const content = input.content.trim();
  const seoTitle = input.seoTitle.trim();
  const seoDescription = input.seoDescription.trim();
  const startingPrice = parsePrice(input.startingPrice);
  const rateUnit = isRateUnit(input.rateUnit) ? input.rateUnit : null;
  const sortOrder = parseSortOrder(input.sortOrder);

  if (!title) {
    return { error: "Service title is required." } as const;
  }

  if (!slug) {
    return { error: "Service slug is required." } as const;
  }

  if (!shortDescription) {
    return { error: "Short description is required." } as const;
  }

  if (input.startingPrice.trim() && startingPrice === null) {
    return { error: "Enter a valid starting price or leave it empty." } as const;
  }

  return {
    data: {
      title,
      slug,
      short_description: shortDescription,
      content: content || null,
      starting_price: startingPrice,
      rate_unit: rateUnit,
      seo_title: seoTitle || title,
      seo_description: seoDescription || shortDescription,
      published: input.published,
      sort_order: sortOrder,
    },
  } as const;
}

async function slugExists(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  slug: string,
  excludeId?: string,
) {
  let query = supabase.from(SERVICES_TABLE).select("id").eq("slug", slug).limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function listServices(): Promise<ServiceListItem[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from(SERVICES_TABLE)
    .select(
      "id, title, slug, short_description, starting_price, rate_unit, published, sort_order, seo_title",
    )
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapServiceListItem(row as ServiceRow));
}

export async function getServiceById(id: string): Promise<ServiceDetail | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from(SERVICES_TABLE)
    .select(
      "id, title, slug, short_description, content, starting_price, rate_unit, seo_title, seo_description, featured_image_url, published, sort_order",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapServiceDetail(data as ServiceRow) : null;
}

export async function createService(
  input: ServiceFormInput,
): Promise<ServiceActionResult> {
  const { supabase, user } = await requireAdmin();
  const validated = validateServiceInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  try {
    if (await slugExists(supabase, validated.data.slug)) {
      return { success: false, error: "A service with this slug already exists." };
    }

    const { data, error } = await supabase
      .from(SERVICES_TABLE)
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
        error: error?.message ?? "Could not create service.",
      };
    }

    revalidatePath("/admin/services");
    revalidatePath("/");

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create service.",
    };
  }
}

export async function updateService(
  id: string,
  input: ServiceFormInput,
): Promise<ServiceActionResult> {
  const { supabase } = await requireAdmin();
  const validated = validateServiceInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  try {
    if (await slugExists(supabase, validated.data.slug, id)) {
      return { success: false, error: "A service with this slug already exists." };
    }

    const { data, error } = await supabase
      .from(SERVICES_TABLE)
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
        error: error?.message ?? "Could not update service.",
      };
    }

    revalidatePath("/admin/services");
    revalidatePath("/");

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update service.",
    };
  }
}

export async function deleteService(id: string): Promise<ServiceActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from(SERVICES_TABLE).delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/");

  return { success: true, id };
}