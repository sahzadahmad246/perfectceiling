export type QuotationUnitType = "sq_ft" | "running_ft" | "piece" | "lump_sum";

export const QUOTATION_STATUSES = [
  "draft",
  "created",
  "rejected",
  "expired",
  "in_progress",
  "completed",
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export const QUOTATION_ADMIN_STATUSES = [
  "created",
  "rejected",
  "expired",
  "in_progress",
  "completed",
] as const;

export type QuotationAdminStatus = (typeof QUOTATION_ADMIN_STATUSES)[number];

export const QUOTATION_AUTO_EXPIRE_DAYS = 7;

export const QUOTATION_AUTO_EXPIRE_STATUSES: QuotationAdminStatus[] = [
  "created",
];

export const MAX_QUOTATION_ITEM_IMAGES = 3;

export type QuotationLineItemImageDraft = {
  id: string;
  url: string;
  storagePath: string;
  description: string;
  fileName?: string;
};

export type QuotationLineItemDraft = {
  id: string;
  name: string;
  description: string;
  unitType: QuotationUnitType;
  quantity: string;
  rate: string;
  amount: string;
  notes: string;
  isLumpSum: boolean;
  images: QuotationLineItemImageDraft[];
};

export type QuotationCustomerDraft = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  notes: string;
};

export type QuotationDiscountType = "fixed" | "percentage";

export type QuotationWorkDraft = {
  workTitle: string;
  items: QuotationLineItemDraft[];
  discount: string;
  discountType: QuotationDiscountType;
  quotationTerms: string;
};

export type CreateQuotationInput = {
  customer: QuotationCustomerDraft;
  work: QuotationWorkDraft;
};

export const QUOTATION_LIST_PAGE_SIZE = 20;

export const QUOTATION_LIST_FILTERS = [
  { id: "all", label: "All" },
  { id: "created", label: "Created" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
  { id: "expired", label: "Expired" },
  { id: "newest", label: "Newest" },
  { id: "recent", label: "Recent" },
] as const;

export type QuotationListFilter = (typeof QUOTATION_LIST_FILTERS)[number]["id"];

const QUOTATION_LIST_STATUS_FILTER_IDS = new Set([
  "created",
  "in_progress",
  "completed",
  "rejected",
  "expired",
]);

export type QuotationListItem = {
  id: string;
  quotationNumber: string;
  workTitle: string | null;
  grandTotal: number;
  status: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
};

export function applyQuotationListFilter(
  quotations: QuotationListItem[],
  query: string,
  filter: QuotationListFilter,
) {
  const normalized = query.trim().toLowerCase();
  const statusFilter = QUOTATION_LIST_STATUS_FILTER_IDS.has(filter)
    ? filter
    : null;
  const sortByUpdatedAt = filter === "recent";

  const filtered = quotations.filter((quotation) => {
    if (statusFilter && quotation.status !== statusFilter) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = [
      quotation.quotationNumber,
      quotation.customerName,
      quotation.customerPhone,
      quotation.customerAddress,
      quotation.workTitle ?? "",
      quotation.status,
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

export type QuotationDraftListItem = {
  id: string;
  label: string;
  workTitle: string | null;
  itemCount: number;
  updatedAt: string;
};

export type QuotationDetail = {
  id: string;
  quotationNumber: string;
  workTitle: string | null;
  date: string;
  validUntil: string | null;
  subtotal: number;
  discountType: string;
  discountValue: number;
  taxValue: number;
  grandTotal: number;
  terms: string | null;
  status: string;
  customer: {
    name: string;
    phone: string;
    whatsapp: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    notes: string | null;
  } | null;
  items: Array<{
    id: string;
    description: string;
    unitType: QuotationUnitType;
    quantity: number;
    rate: number;
    amount: number;
    notes: string | null;
    sortOrder: number;
    images: QuotationLineItemImageDraft[];
  }>;
};

export function createEmptyLineItem(): QuotationLineItemDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    unitType: "sq_ft",
    quantity: "",
    rate: "",
    amount: "",
    notes: "",
    isLumpSum: false,
    images: [],
  };
}

export function createEmptyLineItemImage(): QuotationLineItemImageDraft {
  return {
    id: crypto.randomUUID(),
    url: "",
    storagePath: "",
    description: "",
  };
}

export function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateLineItemAmount(item: QuotationLineItemDraft) {
  if (item.isLumpSum) {
    return parseNumber(item.amount);
  }

  return parseNumber(item.quantity) * parseNumber(item.rate);
}

export function calculateSubtotal(items: QuotationLineItemDraft[]) {
  return items.reduce((sum, item) => sum + calculateLineItemAmount(item), 0);
}

export function calculateDiscountAmount(
  subtotal: number,
  discountType: QuotationDiscountType,
  discountValue: string,
) {
  const parsed = parseNumber(discountValue);

  if (parsed <= 0) {
    return 0;
  }

  if (discountType === "percentage") {
    return Math.min(subtotal, (subtotal * parsed) / 100);
  }

  return Math.min(subtotal, parsed);
}

export function calculateGrandTotal(
  subtotal: number,
  discountValue: string,
  discountType: QuotationDiscountType = "fixed",
) {
  const discount = calculateDiscountAmount(subtotal, discountType, discountValue);

  return Math.max(0, subtotal - discount);
}

export function hasWorkDiscount(work: QuotationWorkDraft) {
  return parseNumber(work.discount) > 0;
}

export type HasDraftContentOptions = {
  defaultQuotationTerms?: string;
};

export function hasDraftContent(
  input: CreateQuotationInput,
  options?: HasDraftContentOptions,
) {
  const { customer, work } = input;
  const defaultTerms = options?.defaultQuotationTerms?.trim() ?? "";

  if (
    customer.name.trim() ||
    customer.phone.trim() ||
    customer.whatsapp.trim() ||
    customer.email.trim() ||
    customer.address.trim() ||
    customer.city.trim() ||
    customer.notes.trim()
  ) {
    return true;
  }

  if (work.workTitle.trim() || work.discount.trim()) {
    return true;
  }

  const terms = work.quotationTerms.trim();

  if (terms && terms !== defaultTerms) {
    return true;
  }

  return work.items.some(
    (item) =>
      item.name.trim() ||
      item.description.trim() ||
      item.quantity.trim() ||
      item.rate.trim() ||
      item.amount.trim() ||
      item.images.length > 0,
  );
}

export function normalizeQuotationDiscountType(
  discountType: string | null | undefined,
): QuotationDiscountType {
  return discountType?.toLowerCase() === "percentage" ? "percentage" : "fixed";
}

export function getQuotationDiscountDisplay(quotation: {
  subtotal: number;
  grandTotal: number;
  discountType: string;
  discountValue: number;
}) {
  const discountType = normalizeQuotationDiscountType(quotation.discountType);
  const discountInput = String(quotation.discountValue);
  const discountAmount = Math.max(0, quotation.subtotal - quotation.grandTotal);

  return {
    discountType,
    discountInput,
    discountAmount,
    hasDiscount: discountAmount > 0,
  };
}

export function formatDiscountLabel(
  discountType: QuotationDiscountType,
  discountValue: string,
) {
  const parsed = parseNumber(discountValue);

  if (discountType === "percentage") {
    return `${parsed}%`;
  }

  return "Fixed";
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getUnitLabel(unitType: QuotationUnitType) {
  switch (unitType) {
    case "sq_ft":
      return "sq.ft";
    case "running_ft":
      return "running ft";
    case "piece":
      return "piece";
    case "lump_sum":
      return "lump sum";
    default:
      return unitType;
  }
}

export function formatUnitType(unitType: QuotationUnitType, isLumpSum = false) {
  if (isLumpSum || unitType === "lump_sum") {
    return "Lump sum";
  }

  return getUnitLabel(unitType);
}

export function parseQuotationItemNotes(notes: string | null) {
  if (!notes?.trim()) {
    return { description: "", notes: "" };
  }

  const lines = notes.split("\n");
  const [first, ...rest] = lines;

  return {
    description: first?.trim() ?? "",
    notes: rest.join("\n").trim(),
  };
}

export function quotationDetailToDraft(
  detail: QuotationDetail,
  fallbackTerms: string,
): CreateQuotationInput {
  const customer = detail.customer;

  const items =
    detail.items.length > 0
      ? detail.items.map((item) => {
          const isLumpSum = item.unitType === "lump_sum";
          const { description, notes } = parseQuotationItemNotes(item.notes);

          return {
            id: item.id,
            name: item.description,
            description,
            unitType: isLumpSum ? "sq_ft" : item.unitType,
            quantity: isLumpSum ? "" : String(item.quantity),
            rate: isLumpSum ? "" : String(item.rate),
            amount: isLumpSum ? String(item.amount) : "",
            notes,
            isLumpSum,
            images: item.images ?? [],
          } satisfies QuotationLineItemDraft;
        })
      : [];

  return {
    customer: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      whatsapp: customer?.whatsapp ?? "",
      email: customer?.email ?? "",
      address: customer?.address ?? "",
      city: customer?.city ?? "",
      notes: customer?.notes ?? "",
    },
    work: {
      workTitle: detail.workTitle ?? "",
      items,
      discount: String(detail.discountValue),
      discountType:
        detail.discountType === "percentage" ? "percentage" : "fixed",
      quotationTerms: detail.terms ?? fallbackTerms,
    },
  };
}

export function formatQuotationDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatTimeOfDay(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(date: Date, now = Date.now()) {
  const diffSeconds = Math.floor((now - date.getTime()) / 1000);

  if (diffSeconds < 10) {
    return "just now";
  }

  if (diffSeconds < 60) {
    return `${diffSeconds} sec ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return formatQuotationDate(date.toISOString().slice(0, 10));
}

export function normalizeQuotationStatus(status: string): QuotationStatus | string {
  if (status === "sent" || status === "accepted") {
    return "created";
  }

  if ((QUOTATION_STATUSES as readonly string[]).includes(status)) {
    return status as QuotationStatus;
  }

  return status;
}

const QUOTATION_STATUS_THEMES = {
  created: {
    label: "Created",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
    glowCore: "rgba(99, 102, 241, 0.16)",
    glowMid: "rgba(129, 140, 248, 0.06)",
  },
  in_progress: {
    label: "In progress",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    glowCore: "rgba(245, 158, 11, 0.17)",
    glowMid: "rgba(251, 191, 36, 0.06)",
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    glowCore: "rgba(244, 63, 94, 0.15)",
    glowMid: "rgba(251, 113, 133, 0.05)",
  },
  expired: {
    label: "Expired",
    className: "border-zinc-300 bg-zinc-100 text-zinc-600",
    glowCore: "rgba(113, 113, 122, 0.16)",
    glowMid: "rgba(161, 161, 170, 0.06)",
  },
  completed: {
    label: "Completed",
    className: "border-green-200 bg-green-50 text-green-700",
    glowCore: "rgba(34, 197, 94, 0.17)",
    glowMid: "rgba(74, 222, 128, 0.06)",
  },
  draft: {
    label: "Draft",
    className: "border-border-soft bg-surface-muted text-muted",
    glowCore: "rgba(161, 161, 170, 0.1)",
    glowMid: "rgba(212, 212, 216, 0.04)",
  },
} as const;

function getQuotationStatusTheme(status: string) {
  const normalized = normalizeQuotationStatus(status);

  if (normalized in QUOTATION_STATUS_THEMES) {
    return QUOTATION_STATUS_THEMES[
      normalized as keyof typeof QUOTATION_STATUS_THEMES
    ];
  }

  return {
    label:
      typeof normalized === "string"
        ? normalized.charAt(0).toUpperCase() +
          normalized.slice(1).replace(/_/g, " ")
        : "Unknown",
    className: "border-border-soft bg-surface-muted text-muted",
    glowCore: "rgba(161, 161, 170, 0.1)",
    glowMid: "rgba(212, 212, 216, 0.04)",
  };
}

export function getQuotationStatusStyle(status: string) {
  const theme = getQuotationStatusTheme(status);

  return {
    label: theme.label,
    className: theme.className,
  };
}

function quotationStatusSunrise(core: string, mid: string) {
  return {
    backgroundImage: `radial-gradient(ellipse 150% 95% at 50% 108%, ${core} 0%, ${mid} 38%, transparent 68%)`,
  };
}

export function getQuotationStatusCardGlow(status: string) {
  const theme = getQuotationStatusTheme(status);

  return quotationStatusSunrise(theme.glowCore, theme.glowMid);
}