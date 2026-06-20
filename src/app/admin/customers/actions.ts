"use server";

import { requireAdmin } from "@/lib/auth/admin";
import {
  type CustomerDetail,
  type CustomerInvoiceHistoryItem,
  type CustomerListItem,
  type CustomerQuotationHistoryItem,
  formatCustomerPhoneFromKey,
  isPlaceholderCustomerPhone,
  normalizeCustomerPhoneKey,
} from "@/lib/customers";
import { validatePhoneNumber } from "@/lib/phone";

type StoredCustomerRow = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  quotations: Array<{
    id: string;
    quotation_number: string;
    work_title: string | null;
    grand_total: number;
    status: string;
    date: string;
    created_at: string;
    updated_at: string;
  }> | null;
  invoices: Array<{
    id: string;
    invoice_number: string;
    work_title: string | null;
    grand_total: number;
    paid_amount: number;
    balance_amount: number;
    payment_status: string;
    invoice_date: string;
    created_at: string;
    updated_at: string;
  }> | null;
};

type CustomerAccumulator = {
  phoneKey: string;
  customerIds: Set<string>;
  profile: StoredCustomerRow | null;
  quotations: CustomerQuotationHistoryItem[];
  invoices: CustomerInvoiceHistoryItem[];
  totalQuoted: number;
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
};

function formatCustomerAddress(address: string | null, city: string | null) {
  return [address, city].filter((part) => part?.trim()).join(", ");
}

function formatDisplayPhone(phone: string, phoneKey: string) {
  const validation = validatePhoneNumber(phone.trim());

  if (validation.valid) {
    return validation.formatted;
  }

  return formatCustomerPhoneFromKey(phoneKey) || phone.trim();
}

function pickPreferredProfile(
  current: StoredCustomerRow | null,
  candidate: StoredCustomerRow,
) {
  if (!current) {
    return candidate;
  }

  return new Date(candidate.updated_at).getTime() >
    new Date(current.updated_at).getTime()
    ? candidate
    : current;
}

function hasCustomerActivity(
  quotations: CustomerQuotationHistoryItem[],
  invoices: CustomerInvoiceHistoryItem[],
) {
  return quotations.length > 0 || invoices.length > 0;
}

function resolveLastActivityAt(
  quotations: CustomerQuotationHistoryItem[],
  invoices: CustomerInvoiceHistoryItem[],
  fallback: string,
) {
  const latestQuotationAt = quotations[0]?.createdAt;
  const latestInvoiceAt = invoices[0]?.createdAt;

  if (latestQuotationAt && latestInvoiceAt) {
    return new Date(latestQuotationAt).getTime() >
      new Date(latestInvoiceAt).getTime()
      ? latestQuotationAt
      : latestInvoiceAt;
  }

  return latestQuotationAt ?? latestInvoiceAt ?? fallback;
}

function mapQuotationRows(
  rows: StoredCustomerRow["quotations"],
): CustomerQuotationHistoryItem[] {
  return (rows ?? [])
    .filter((row) => row.status !== "draft")
    .map((row) => ({
      id: row.id,
      quotationNumber: row.quotation_number,
      workTitle: row.work_title,
      grandTotal: Number(row.grand_total),
      status: row.status,
      date: row.date,
      createdAt: row.created_at,
    }))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

function mapInvoiceRows(
  rows: StoredCustomerRow["invoices"],
): CustomerInvoiceHistoryItem[] {
  return (rows ?? [])
    .map((row) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      workTitle: row.work_title,
      grandTotal: Number(row.grand_total),
      paidAmount: Number(row.paid_amount),
      balanceAmount: Number(row.balance_amount),
      paymentStatus: row.payment_status,
      invoiceDate: row.invoice_date,
      createdAt: row.created_at,
    }))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

function buildCustomerGroups(rows: StoredCustomerRow[]) {
  const groups = new Map<string, CustomerAccumulator>();

  for (const row of rows) {
    const phoneKey = normalizeCustomerPhoneKey(row.phone);

    if (isPlaceholderCustomerPhone(phoneKey)) {
      continue;
    }

    const existing = groups.get(phoneKey);
    const quotations = mapQuotationRows(row.quotations);
    const invoices = mapInvoiceRows(row.invoices);

    if (!hasCustomerActivity(quotations, invoices)) {
      continue;
    }

    const quotedTotal = quotations.reduce(
      (sum, quotation) => sum + quotation.grandTotal,
      0,
    );
    const invoicedTotal = invoices.reduce(
      (sum, invoice) => sum + invoice.grandTotal,
      0,
    );
    const paidTotal = invoices.reduce(
      (sum, invoice) => sum + invoice.paidAmount,
      0,
    );
    const pendingTotal = invoices.reduce(
      (sum, invoice) => sum + invoice.balanceAmount,
      0,
    );
    const rowLastActivityAt = resolveLastActivityAt(
      quotations,
      invoices,
      row.updated_at,
    );

    if (!existing) {
      groups.set(phoneKey, {
        phoneKey,
        customerIds: new Set([row.id]),
        profile: row,
        quotations,
        invoices,
        totalQuoted: quotedTotal,
        totalInvoiced: invoicedTotal,
        totalPaid: paidTotal,
        totalPending: pendingTotal,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastActivityAt: rowLastActivityAt,
      });
      continue;
    }

    existing.customerIds.add(row.id);
    existing.profile = pickPreferredProfile(existing.profile, row);
    existing.quotations.push(...quotations);
    existing.invoices.push(...invoices);
    existing.totalQuoted += quotedTotal;
    existing.totalInvoiced += invoicedTotal;
    existing.totalPaid += paidTotal;
    existing.totalPending += pendingTotal;

    if (new Date(row.created_at).getTime() < new Date(existing.createdAt).getTime()) {
      existing.createdAt = row.created_at;
    }

    if (new Date(row.updated_at).getTime() > new Date(existing.updatedAt).getTime()) {
      existing.updatedAt = row.updated_at;
    }

    if (
      new Date(rowLastActivityAt).getTime() >
      new Date(existing.lastActivityAt).getTime()
    ) {
      existing.lastActivityAt = rowLastActivityAt;
    }
  }

  for (const group of groups.values()) {
    const quotationIds = new Set<string>();
    const invoiceIds = new Set<string>();

    group.quotations = group.quotations
      .filter((quotation) => {
        if (quotationIds.has(quotation.id)) {
          return false;
        }

        quotationIds.add(quotation.id);
        return true;
      })
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );

    group.invoices = group.invoices
      .filter((invoice) => {
        if (invoiceIds.has(invoice.id)) {
          return false;
        }

        invoiceIds.add(invoice.id);
        return true;
      })
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
  }

  return [...groups.values()].filter((group) =>
    hasCustomerActivity(group.quotations, group.invoices),
  );
}

function mapCustomerListItem(group: CustomerAccumulator): CustomerListItem {
  const profile = group.profile;

  return {
    phoneKey: group.phoneKey,
    name: profile?.name?.trim() || "Unknown customer",
    phone: profile ? formatDisplayPhone(profile.phone, group.phoneKey) : "",
    address: formatCustomerAddress(profile?.address ?? null, profile?.city ?? null),
    quotationCount: group.quotations.length,
    invoiceCount: group.invoices.length,
    totalQuoted: group.totalQuoted,
    totalInvoiced: group.totalInvoiced,
    totalPaid: group.totalPaid,
    totalPending: group.totalPending,
    lastActivityAt: group.lastActivityAt,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

function mapCustomerDetail(group: CustomerAccumulator): CustomerDetail {
  const profile = group.profile;

  return {
    phoneKey: group.phoneKey,
    name: profile?.name?.trim() || "Unknown customer",
    phone: profile ? formatDisplayPhone(profile.phone, group.phoneKey) : "",
    whatsapp: profile?.whatsapp?.trim() || null,
    email: profile?.email?.trim() || null,
    address: formatCustomerAddress(profile?.address ?? null, profile?.city ?? null),
    notes: profile?.notes?.trim() || null,
    quotationCount: group.quotations.length,
    invoiceCount: group.invoices.length,
    totalQuoted: group.totalQuoted,
    totalInvoiced: group.totalInvoiced,
    totalPaid: group.totalPaid,
    totalPending: group.totalPending,
    quotations: group.quotations,
    invoices: group.invoices,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

async function fetchCustomerRows() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      id,
      name,
      phone,
      whatsapp,
      email,
      address,
      city,
      notes,
      created_at,
      updated_at,
      quotations (
        id,
        quotation_number,
        work_title,
        grand_total,
        status,
        date,
        created_at,
        updated_at
      ),
      invoices (
        id,
        invoice_number,
        work_title,
        grand_total,
        paid_amount,
        balance_amount,
        payment_status,
        invoice_date,
        created_at,
        updated_at
      )
    `,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as StoredCustomerRow[];
}

export async function listCustomers(): Promise<CustomerListItem[]> {
  const rows = await fetchCustomerRows();
  const groups = buildCustomerGroups(rows);

  return groups
    .map(mapCustomerListItem)
    .sort(
      (left, right) =>
        new Date(right.lastActivityAt).getTime() -
        new Date(left.lastActivityAt).getTime(),
    );
}

function findCustomerGroup(
  groups: ReturnType<typeof buildCustomerGroups>,
  phoneKey: string,
) {
  const normalizedKey = normalizeCustomerPhoneKey(phoneKey);

  if (!normalizedKey) {
    return null;
  }

  const exactMatch = groups.find((entry) => entry.phoneKey === normalizedKey);

  if (exactMatch) {
    return exactMatch;
  }

  const rawDigits = phoneKey.replace(/\D/g, "");

  return (
    groups.find((entry) => {
      if (entry.phoneKey === rawDigits) {
        return true;
      }

      if (entry.phoneKey.endsWith(rawDigits) || rawDigits.endsWith(entry.phoneKey)) {
        return true;
      }

      return normalizeCustomerPhoneKey(entry.phoneKey) === normalizedKey;
    }) ?? null
  );
}

export async function getCustomerByPhoneKey(
  phoneKey: string,
): Promise<CustomerDetail | null> {
  const normalizedKey = normalizeCustomerPhoneKey(phoneKey);

  if (isPlaceholderCustomerPhone(normalizedKey)) {
    return null;
  }

  const rows = await fetchCustomerRows();
  const groups = buildCustomerGroups(rows);
  const group = findCustomerGroup(groups, phoneKey);

  if (!group) {
    return null;
  }

  return mapCustomerDetail(group);
}