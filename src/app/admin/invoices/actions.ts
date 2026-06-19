"use server";

import { revalidatePath } from "next/cache";

import { getQuotationById } from "@/app/admin/quotations/actions";
import { requireAdmin } from "@/lib/auth/admin";
import { getNextDocumentNumber } from "@/lib/document-numbers";
import { validateQuotationCustomer } from "@/lib/customer-validation";
import {
  calculateDiscountAmount,
  calculateGrandTotal,
  calculateLineItemAmount,
  invoiceDetailToDraft,
  parseNumber,
  quotationDetailToInvoiceDraft,
  resolvePaymentStatus,
  type CreateInvoiceInput,
  type InvoiceDetail,
  type InvoiceLineItemDraft,
  type InvoiceListItem,
  type InvoicePayment,
  type InvoicePaymentStatus,
  type InvoiceUnitType,
} from "@/lib/invoices";

export type InvoiceDefaults = {
  invoiceTerms: string;
  bankDetails: string;
};

export type InvoiceActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type InvoiceDeleteResult =
  | { success: true }
  | { success: false; error: string };

export type PaymentActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

async function generateInvoiceNumber(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
) {
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number");

  if (error) {
    throw new Error(error.message);
  }

  return getNextDocumentNumber(
    (data ?? []).map((row) => row.invoice_number),
    "INV",
  );
}

function buildItemRows(invoiceId: string, items: InvoiceLineItemDraft[]) {
  const validItems = items.filter((item) => item.name.trim());

  return validItems.map((item, index) => {
    const amount = calculateLineItemAmount(item);
    const unitType = item.isLumpSum ? "lump_sum" : item.unitType;

    return {
      id: item.id,
      invoice_id: invoiceId,
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

async function saveInvoiceItems(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  invoiceId: string,
  items: InvoiceLineItemDraft[],
) {
  const itemRows = buildItemRows(invoiceId, items);

  if (itemRows.length === 0) {
    return null;
  }

  const { error } = await supabase.from("invoice_items").insert(itemRows);

  return error;
}

function validateInvoiceInput(input: CreateInvoiceInput) {
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

  const subtotal = validItems.reduce(
    (sum, item) => sum + calculateLineItemAmount(item),
    0,
  );
  const discountType =
    input.work.discountType === "percentage" ? "percentage" : "fixed";
  const discountInput = parseNumber(input.work.discount);

  if (discountInput > 0) {
    const discountAmount = calculateDiscountAmount(
      subtotal,
      discountType,
      input.work.discount,
    );

    if (discountAmount <= 0) {
      return {
        success: false as const,
        error: "Discount must be greater than 0.",
      };
    }

    if (discountAmount > subtotal) {
      return {
        success: false as const,
        error: "Discount cannot be more than the subtotal.",
      };
    }

    if (discountType === "percentage" && discountInput > 100) {
      return {
        success: false as const,
        error: "Percentage discount cannot be more than 100.",
      };
    }
  }

  return {
    success: true as const,
    validItems,
    customerName,
    customerPhone,
    customerAddress,
  };
}

export async function getInvoiceDefaults(): Promise<InvoiceDefaults> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("business_settings")
    .select("default_invoice_terms, bank_details")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    invoiceTerms: data?.default_invoice_terms?.trim() ?? "",
    bankDetails: data?.bank_details?.trim() ?? "",
  };
}

export async function listInvoices(): Promise<InvoiceListItem[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      work_title,
      grand_total,
      paid_amount,
      balance_amount,
      payment_status,
      invoice_date,
      due_date,
      created_at,
      updated_at,
      quotation_id,
      customers (
        name,
        phone,
        address,
        city
      ),
      quotations (
        quotation_number
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
    const quotation = Array.isArray(row.quotations)
      ? row.quotations[0]
      : row.quotations;

    const customerAddress = [customer?.address, customer?.city]
      .filter((part) => part?.trim())
      .join(", ");

    return {
      id: row.id,
      invoiceNumber: row.invoice_number,
      workTitle: row.work_title,
      grandTotal: Number(row.grand_total),
      paidAmount: Number(row.paid_amount),
      balanceAmount: Number(row.balance_amount),
      paymentStatus: row.payment_status as InvoicePaymentStatus,
      invoiceDate: row.invoice_date,
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      customerName: customer?.name ?? "Unknown customer",
      customerPhone: customer?.phone ?? "",
      customerAddress,
      quotationId: row.quotation_id,
      quotationNumber: quotation?.quotation_number ?? null,
    };
  });
}

function mapInvoiceDetail(
  data: {
    id: string;
    invoice_number: string;
    quotation_id: string | null;
    work_title: string | null;
    invoice_date: string;
    due_date: string | null;
    subtotal: number;
    discount_type: string;
    discount_value: number;
    tax_value: number;
    grand_total: number;
    paid_amount: number;
    balance_amount: number;
    payment_status: string;
    notes: string | null;
    customers: unknown;
    quotations: unknown;
  },
  items: Array<{
    id: string;
    description: string;
    unit_type: string;
    quantity: number;
    rate: number;
    amount: number;
    notes: string | null;
    sort_order: number;
  }>,
  payments: InvoicePayment[],
): InvoiceDetail {
  const customer = Array.isArray(data.customers)
    ? data.customers[0]
    : data.customers;
  const quotation = Array.isArray(data.quotations)
    ? data.quotations[0]
    : data.quotations;

  return {
    id: data.id,
    invoiceNumber: data.invoice_number,
    quotationId: data.quotation_id,
    quotationNumber: quotation?.quotation_number ?? null,
    workTitle: data.work_title,
    invoiceDate: data.invoice_date,
    dueDate: data.due_date,
    subtotal: Number(data.subtotal),
    discountType: data.discount_type,
    discountValue: Number(data.discount_value),
    taxValue: Number(data.tax_value),
    grandTotal: Number(data.grand_total),
    paidAmount: Number(data.paid_amount),
    balanceAmount: Number(data.balance_amount),
    paymentStatus: data.payment_status as InvoicePaymentStatus,
    notes: data.notes,
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
    items: items.map((item) => ({
      id: item.id,
      description: item.description,
      unitType: item.unit_type as InvoiceUnitType,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      notes: item.notes,
      sortOrder: item.sort_order,
    })),
    payments,
  };
}

export async function getInvoiceById(id: string): Promise<InvoiceDetail | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      quotation_id,
      work_title,
      invoice_date,
      due_date,
      subtotal,
      discount_type,
      discount_value,
      tax_value,
      grand_total,
      paid_amount,
      balance_amount,
      payment_status,
      notes,
      customers (
        name,
        phone,
        whatsapp,
        email,
        address,
        city,
        notes
      ),
      quotations (
        quotation_number
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

  const [{ data: items, error: itemsError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase
        .from("invoice_items")
        .select(
          "id, description, unit_type, quantity, rate, amount, notes, sort_order",
        )
        .eq("invoice_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("payments")
        .select("id, amount, payment_method, payment_date, notes, created_at")
        .eq("invoice_id", id)
        .order("payment_date", { ascending: false }),
    ]);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const mappedPayments: InvoicePayment[] = (payments ?? []).map((payment) => ({
    id: payment.id,
    amount: Number(payment.amount),
    paymentMethod: payment.payment_method,
    paymentDate: payment.payment_date,
    notes: payment.notes,
    createdAt: payment.created_at,
  }));

  return mapInvoiceDetail(data, items ?? [], mappedPayments);
}

export async function getInvoiceEditData(
  id: string,
): Promise<CreateInvoiceInput | null> {
  const [invoice, defaults] = await Promise.all([
    getInvoiceById(id),
    getInvoiceDefaults(),
  ]);

  if (!invoice) {
    return null;
  }

  return invoiceDetailToDraft(invoice, defaults.invoiceTerms);
}

export async function getInvoiceDataFromQuotation(
  quotationId: string,
): Promise<CreateInvoiceInput | null> {
  const [quotation, defaults] = await Promise.all([
    getQuotationById(quotationId),
    getInvoiceDefaults(),
  ]);

  if (!quotation || quotation.status === "draft") {
    return null;
  }

  return quotationDetailToInvoiceDraft(quotation, defaults.invoiceTerms);
}

export async function createInvoice(
  input: CreateInvoiceInput,
  quotationId?: string | null,
): Promise<InvoiceActionResult> {
  const validation = validateInvoiceInput(input);

  if (!validation.success) {
    return validation;
  }

  const { validItems, customerName, customerPhone, customerAddress } = validation;

  try {
    const { supabase, user } = await requireAdmin();
    const invoiceNumber = await generateInvoiceNumber(supabase);
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

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        quotation_id: quotationId?.trim() || null,
        customer_id: customer.id,
        work_title: input.work.workTitle.trim() || null,
        invoice_date: new Date().toISOString().slice(0, 10),
        due_date: input.work.dueDate.trim() || null,
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        tax_value: 0,
        grand_total: grandTotal,
        paid_amount: 0,
        balance_amount: grandTotal,
        payment_status: "unpaid",
        notes: input.work.invoiceTerms.trim() || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (invoiceError) {
      return { success: false, error: invoiceError.message };
    }

    const itemsError = await saveInvoiceItems(supabase, invoice.id, validItems);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/invoices/${invoice.id}`);

    return { success: true, id: invoice.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create invoice.",
    };
  }
}

export async function updateInvoice(
  id: string,
  input: CreateInvoiceInput,
): Promise<InvoiceActionResult> {
  const validation = validateInvoiceInput(input);

  if (!validation.success) {
    return validation;
  }

  const { validItems, customerName, customerPhone, customerAddress } = validation;

  try {
    const { supabase } = await requireAdmin();

    const { data: existingInvoice, error: existingError } = await supabase
      .from("invoices")
      .select("id, customer_id, paid_amount, grand_total")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return { success: false, error: existingError.message };
    }

    if (!existingInvoice) {
      return { success: false, error: "Invoice not found." };
    }

    if (existingInvoice.customer_id) {
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
        .eq("id", existingInvoice.customer_id);

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
    const paidAmount = Number(existingInvoice.paid_amount);
    const balanceAmount = Math.max(0, grandTotal - paidAmount);
    const paymentStatus = resolvePaymentStatus(grandTotal, paidAmount);

    const { error: invoiceError } = await supabase
      .from("invoices")
      .update({
        work_title: input.work.workTitle.trim() || null,
        due_date: input.work.dueDate.trim() || null,
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        tax_value: 0,
        grand_total: grandTotal,
        balance_amount: balanceAmount,
        payment_status: paymentStatus,
        notes: input.work.invoiceTerms.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (invoiceError) {
      return { success: false, error: invoiceError.message };
    }

    const { error: deleteItemsError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (deleteItemsError) {
      return { success: false, error: deleteItemsError.message };
    }

    const itemsError = await saveInvoiceItems(supabase, id, validItems);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/invoices/${id}`);

    return { success: true, id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update invoice.",
    };
  }
}

export async function deleteInvoice(id: string): Promise<InvoiceDeleteResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/invoices");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete invoice.",
    };
  }
}

export async function recordPayment(
  invoiceId: string,
  input: {
    amount: string;
    paymentDate: string;
    notes: string;
    paymentMethod?: string;
  },
): Promise<PaymentActionResult> {
  const amount = parseNumber(input.amount);

  if (amount <= 0) {
    return { success: false, error: "Payment amount must be greater than 0." };
  }

  if (!input.paymentDate.trim()) {
    return { success: false, error: "Payment date is required." };
  }

  try {
    const { supabase } = await requireAdmin();

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, grand_total, paid_amount, balance_amount")
      .eq("id", invoiceId)
      .maybeSingle();

    if (invoiceError) {
      return { success: false, error: invoiceError.message };
    }

    if (!invoice) {
      return { success: false, error: "Invoice not found." };
    }

    const balance = Number(invoice.balance_amount);

    if (amount > balance) {
      return {
        success: false,
        error: `Payment cannot exceed the due amount of ₹${balance.toFixed(2)}.`,
      };
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        invoice_id: invoiceId,
        amount,
        payment_date: input.paymentDate.trim(),
        notes: input.notes.trim() || null,
        payment_method: input.paymentMethod?.trim() || null,
      })
      .select("id")
      .single();

    if (paymentError) {
      return { success: false, error: paymentError.message };
    }

    const newPaidAmount = Number(invoice.paid_amount) + amount;
    const grandTotal = Number(invoice.grand_total);
    const newBalance = Math.max(0, grandTotal - newPaidAmount);
    const paymentStatus = resolvePaymentStatus(grandTotal, newPaidAmount);

    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        paid_amount: newPaidAmount,
        balance_amount: newBalance,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/invoices/${invoiceId}`);

    return { success: true, id: payment.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not record payment.",
    };
  }
}

export async function deletePayment(
  paymentId: string,
  invoiceId: string,
): Promise<PaymentActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("id", paymentId)
      .eq("invoice_id", invoiceId)
      .maybeSingle();

    if (paymentError) {
      return { success: false, error: paymentError.message };
    }

    if (!payment) {
      return { success: false, error: "Payment not found." };
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, grand_total, paid_amount")
      .eq("id", invoiceId)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return { success: false, error: "Invoice not found." };
    }

    const { error: deleteError } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    const newPaidAmount = Math.max(
      0,
      Number(invoice.paid_amount) - Number(payment.amount),
    );
    const grandTotal = Number(invoice.grand_total);
    const newBalance = Math.max(0, grandTotal - newPaidAmount);
    const paymentStatus = resolvePaymentStatus(grandTotal, newPaidAmount);

    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        paid_amount: newPaidAmount,
        balance_amount: newBalance,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/invoices/${invoiceId}`);

    return { success: true, id: paymentId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete payment.",
    };
  }
}