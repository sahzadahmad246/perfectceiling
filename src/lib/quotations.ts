export type QuotationUnitType = "sq_ft" | "running_ft" | "piece" | "lump_sum";

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

export type QuotationListItem = {
  id: string;
  quotationNumber: string;
  workTitle: string | null;
  grandTotal: number;
  status: string;
  date: string;
  customerName: string;
  customerPhone: string;
};

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

export function hasDraftContent(input: CreateQuotationInput) {
  const { customer, work } = input;

  if (
    customer.name.trim() ||
    customer.phone.trim() ||
    customer.address.trim() ||
    customer.notes.trim()
  ) {
    return true;
  }

  if (
    work.workTitle.trim() ||
    work.quotationTerms.trim() ||
    work.discount.trim()
  ) {
    return true;
  }

  return work.items.some(
    (item) =>
      item.name.trim() ||
      item.description.trim() ||
      item.quantity.trim() ||
      item.rate.trim() ||
      item.amount.trim(),
  );
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

function parseStoredItemNotes(notes: string | null) {
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
          const { description, notes } = parseStoredItemNotes(item.notes);

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

export function getQuotationStatusStyle(status: string) {
  switch (status) {
    case "sent":
      return {
        label: "Sent",
        className: "border-sky-200 bg-sky-50 text-sky-700",
      };
    case "accepted":
      return {
        label: "Accepted",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "rejected":
      return {
        label: "Rejected",
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };
    case "expired":
      return {
        label: "Expired",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "created":
      return {
        label: "Created",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    default:
      return {
        label: "Draft",
        className: "border-border-soft bg-surface-muted text-muted",
      };
  }
}