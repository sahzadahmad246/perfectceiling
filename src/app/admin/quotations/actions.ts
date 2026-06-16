"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import {
  calculateGrandTotal,
  calculateLineItemAmount,
  parseNumber,
  type CreateQuotationInput,
  type QuotationDetail,
  type QuotationListItem,
} from "@/lib/quotations";

export type QuotationActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type QuotationDefaults = {
  quotationTerms: string;
  bankDetails: string;
};

async function generateQuotationNumber(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"]) {
  const { count, error } = await supabase
    .from("quotations")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new Error(error.message);
  }

  const nextNumber = (count ?? 0) + 1;

  return `Q-${String(nextNumber).padStart(4, "0")}`;
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
      customers (
        name,
        phone
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const customer = Array.isArray(row.customers)
      ? row.customers[0]
      : row.customers;

    return {
      id: row.id,
      quotationNumber: row.quotation_number,
      workTitle: row.work_title,
      grandTotal: Number(row.grand_total),
      status: row.status,
      date: row.date,
      customerName: customer?.name ?? "Unknown customer",
      customerPhone: customer?.phone ?? "",
    };
  });
}

export async function getQuotationById(id: string): Promise<QuotationDetail | null> {
  const { supabase } = await requireAdmin();

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
    .select("id, description, unit_type, quantity, rate, amount, notes, sort_order")
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
    items: (items ?? []).map((item) => ({
      id: item.id,
      description: item.description,
      unitType: item.unit_type,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      notes: item.notes,
      sortOrder: item.sort_order,
    })),
  };
}

export async function createQuotation(
  input: CreateQuotationInput,
): Promise<QuotationActionResult> {
  const customerName = input.customer.name.trim();
  const customerPhone = input.customer.phone.trim();

  if (!customerName) {
    return { success: false, error: "Customer name is required." };
  }

  if (!customerPhone) {
    return { success: false, error: "Customer phone is required." };
  }

  const validItems = input.work.items.filter((item) => item.name.trim());

  if (validItems.length === 0) {
    return { success: false, error: "Add at least one work item." };
  }

  for (const item of validItems) {
    const amount = calculateLineItemAmount(item);

    if (amount <= 0) {
      return {
        success: false,
        error: `Item "${item.name.trim()}" needs a valid total amount.`,
      };
    }

    if (!item.isLumpSum && (!parseNumber(item.quantity) || !parseNumber(item.rate))) {
      return {
        success: false,
        error: `Item "${item.name.trim()}" needs area and rate, or use lump sum.`,
      };
    }
  }

  try {
    const { supabase, user } = await requireAdmin();
    const quotationNumber = await generateQuotationNumber(supabase);
    const subtotal = validItems.reduce(
      (sum, item) => sum + calculateLineItemAmount(item),
      0,
    );
    const discountValue = Math.max(0, parseNumber(input.work.discount));
    const grandTotal = calculateGrandTotal(subtotal, input.work.discount);

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
        discount_type: "fixed",
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

    const itemRows = validItems.map((item, index) => {
      const amount = calculateLineItemAmount(item);
      const unitType = item.isLumpSum ? "lump_sum" : item.unitType;

      return {
        quotation_id: quotation.id,
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

    const { error: itemsError } = await supabase
      .from("quotation_items")
      .insert(itemRows);

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