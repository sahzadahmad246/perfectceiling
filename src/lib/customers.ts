import { validatePhoneNumber } from "@/lib/phone";
import { formatCurrency } from "@/lib/quotations";

export const CUSTOMER_LIST_PAGE_SIZE = 20;

export const CUSTOMER_PLACEHOLDER_PHONE_KEY = "0000000000";

export const CUSTOMER_LIST_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "newest", label: "Newest" },
  { id: "recent", label: "Recent" },
] as const;

export type CustomerListFilter = (typeof CUSTOMER_LIST_FILTERS)[number]["id"];

export type CustomerListItem = {
  phoneKey: string;
  name: string;
  phone: string;
  address: string;
  quotationCount: number;
  invoiceCount: number;
  totalQuoted: number;
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerQuotationHistoryItem = {
  id: string;
  quotationNumber: string;
  workTitle: string | null;
  grandTotal: number;
  status: string;
  date: string;
  createdAt: string;
};

export type CustomerInvoiceHistoryItem = {
  id: string;
  invoiceNumber: string;
  workTitle: string | null;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  invoiceDate: string;
  createdAt: string;
};

export type CustomerDetail = {
  phoneKey: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string;
  notes: string | null;
  quotationCount: number;
  invoiceCount: number;
  totalQuoted: number;
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  quotations: CustomerQuotationHistoryItem[];
  invoices: CustomerInvoiceHistoryItem[];
  createdAt: string;
  updatedAt: string;
};

function inferPhoneKeyFromDigits(digits: string) {
  if (!digits) {
    return "";
  }

  if (digits.length >= 11) {
    return digits;
  }

  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `91${digits}`;
  }

  if (digits.length === 9) {
    return `971${digits}`;
  }

  if (digits.length === 8) {
    return `971${digits}`;
  }

  return digits;
}

export function normalizeCustomerPhoneKey(phone: string) {
  const trimmed = phone.trim();

  if (!trimmed) {
    return "";
  }

  const validation = validatePhoneNumber(trimmed);

  if (validation.valid) {
    return validation.formatted.replace(/\D/g, "");
  }

  return inferPhoneKeyFromDigits(trimmed.replace(/\D/g, ""));
}

export function formatCustomerPhoneFromKey(phoneKey: string) {
  const digits = phoneKey.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `+91 ${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2)}`;
  }

  if (digits.length > 10) {
    const dialCodeLength = digits.length <= 11 ? 1 : 2;
    const dialCode = digits.slice(0, dialCodeLength);
    const nationalNumber = digits.slice(dialCodeLength);

    return `+${dialCode} ${nationalNumber}`;
  }

  return digits;
}

export function customerPhoneKeyToHref(phoneKey: string) {
  return `/admin/customers/${encodeURIComponent(phoneKey)}`;
}

export function customerPhoneKeyFromParam(param: string) {
  try {
    return normalizeCustomerPhoneKey(decodeURIComponent(param));
  } catch {
    return normalizeCustomerPhoneKey(param);
  }
}

export function getCustomerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function isPlaceholderCustomerPhone(phoneKey: string) {
  return !phoneKey || phoneKey === CUSTOMER_PLACEHOLDER_PHONE_KEY;
}

export function applyCustomerListFilter(
  customers: CustomerListItem[],
  query: string,
  filter: CustomerListFilter,
) {
  const normalized = query.trim().toLowerCase();
  const sortByUpdatedAt = filter === "recent";

  const filtered = customers.filter((customer) => {
    if (filter === "active" && customer.quotationCount === 0) {
      return false;
    }

    if (filter === "pending" && customer.totalPending <= 0) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = [
      customer.name,
      customer.phone,
      customer.address,
      String(customer.quotationCount),
      String(customer.invoiceCount),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  return [...filtered].sort((left, right) => {
    const leftTime = sortByUpdatedAt
      ? new Date(left.updatedAt).getTime()
      : new Date(left.createdAt).getTime();
    const rightTime = sortByUpdatedAt
      ? new Date(right.updatedAt).getTime()
      : new Date(right.createdAt).getTime();

    return rightTime - leftTime;
  });
}

export function formatCustomerActivityDate(date: string) {
  const parsed = new Date(date.includes("T") ? date : `${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function getCustomerTotalRevenue(customer: {
  totalPaid: number;
  totalInvoiced: number;
  totalQuoted: number;
}) {
  if (customer.totalPaid > 0) {
    return customer.totalPaid;
  }

  if (customer.totalInvoiced > 0) {
    return customer.totalInvoiced;
  }

  return customer.totalQuoted;
}

export function formatCompactCurrency(amount: number) {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs < 1000) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const scaled = abs / 1000;
  const compact =
    scaled % 1 === 0
      ? String(scaled)
      : scaled.toFixed(1).replace(/\.0$/, "");

  return `${sign}₹${compact}k`;
}

export { formatCurrency };