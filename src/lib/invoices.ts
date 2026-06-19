import {
  calculateDiscountAmount as calculateQuotationDiscountAmount,
  calculateGrandTotal as calculateQuotationGrandTotal,
  formatCurrency,
  formatDiscountLabel,
  formatQuotationDate,
  formatUnitType,
  normalizeQuotationDiscountType,
  parseNumber,
  parseQuotationItemNotes,
  type QuotationCustomerDraft,
  type QuotationDetail,
  type QuotationDiscountType,
  type QuotationUnitType,
} from "@/lib/quotations";

export type InvoiceUnitType = QuotationUnitType;
export type InvoiceDiscountType = QuotationDiscountType;
export type InvoiceCustomerDraft = QuotationCustomerDraft;

export const INVOICE_PAYMENT_STATUSES = ["unpaid", "partial", "paid"] as const;
export type InvoicePaymentStatus = (typeof INVOICE_PAYMENT_STATUSES)[number];

export type InvoiceLineItemDraft = {
  id: string;
  name: string;
  description: string;
  unitType: InvoiceUnitType;
  quantity: string;
  rate: string;
  amount: string;
  notes: string;
  isLumpSum: boolean;
};

export type InvoiceWorkDraft = {
  workTitle: string;
  items: InvoiceLineItemDraft[];
  discount: string;
  discountType: InvoiceDiscountType;
  invoiceTerms: string;
  dueDate: string;
};

export type CreateInvoiceInput = {
  customer: InvoiceCustomerDraft;
  work: InvoiceWorkDraft;
};

export const INVOICE_LIST_PAGE_SIZE = 20;

export const INVOICE_LIST_FILTERS = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "partial", label: "Partial" },
  { id: "paid", label: "Paid" },
  { id: "newest", label: "Newest" },
  { id: "recent", label: "Recent" },
] as const;

export type InvoiceListFilter = (typeof INVOICE_LIST_FILTERS)[number]["id"];

const INVOICE_LIST_STATUS_FILTER_IDS = new Set(["unpaid", "partial", "paid"]);

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  workTitle: string | null;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: InvoicePaymentStatus;
  invoiceDate: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  quotationId: string | null;
  quotationNumber: string | null;
};

export type InvoicePayment = {
  id: string;
  amount: number;
  paymentMethod: string | null;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
};

export type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  quotationId: string | null;
  quotationNumber: string | null;
  workTitle: string | null;
  invoiceDate: string;
  dueDate: string | null;
  subtotal: number;
  discountType: string;
  discountValue: number;
  taxValue: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: InvoicePaymentStatus;
  notes: string | null;
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
    unitType: InvoiceUnitType;
    quantity: number;
    rate: number;
    amount: number;
    notes: string | null;
    sortOrder: number;
  }>;
  payments: InvoicePayment[];
};

export function createEmptyInvoiceLineItem(): InvoiceLineItemDraft {
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

export function hasInvoiceWorkDiscount(work: InvoiceWorkDraft) {
  return parseNumber(work.discount) > 0;
}

export function defaultInvoiceDueDate(daysFromNow = 30) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export function calculateLineItemAmount(item: InvoiceLineItemDraft) {
  if (item.isLumpSum) {
    return parseNumber(item.amount);
  }

  return parseNumber(item.quantity) * parseNumber(item.rate);
}

export function calculateSubtotal(items: InvoiceLineItemDraft[]) {
  return items.reduce((sum, item) => sum + calculateLineItemAmount(item), 0);
}

export function calculateDiscountAmount(
  subtotal: number,
  discountType: InvoiceDiscountType,
  discountValue: string,
) {
  return calculateQuotationDiscountAmount(subtotal, discountType, discountValue);
}

export function calculateGrandTotal(
  subtotal: number,
  discountValue: string,
  discountType: InvoiceDiscountType = "fixed",
) {
  return calculateQuotationGrandTotal(subtotal, discountValue, discountType);
}

export {
  formatCurrency,
  formatDiscountLabel,
  formatQuotationDate,
  formatUnitType,
  parseNumber,
  parseQuotationItemNotes,
};

export function applyInvoiceListFilter(
  invoices: InvoiceListItem[],
  query: string,
  filter: InvoiceListFilter,
) {
  const normalized = query.trim().toLowerCase();
  const statusFilter = INVOICE_LIST_STATUS_FILTER_IDS.has(filter)
    ? filter
    : null;
  const sortByUpdatedAt = filter === "recent";

  const filtered = invoices.filter((invoice) => {
    if (statusFilter && invoice.paymentStatus !== statusFilter) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = [
      invoice.invoiceNumber,
      invoice.customerName,
      invoice.customerPhone,
      invoice.customerAddress,
      invoice.workTitle ?? "",
      invoice.quotationNumber ?? "",
      invoice.paymentStatus,
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

export function getInvoiceDiscountDisplay(invoice: {
  subtotal: number;
  grandTotal: number;
  discountType: string;
  discountValue: number;
}) {
  const discountType = normalizeQuotationDiscountType(invoice.discountType);
  const discountInput = String(invoice.discountValue);
  const discountAmount = Math.max(0, invoice.subtotal - invoice.grandTotal);

  return {
    discountType,
    discountInput,
    discountAmount,
    hasDiscount: discountAmount > 0,
  };
}

export function resolvePaymentStatus(
  grandTotal: number,
  paidAmount: number,
): InvoicePaymentStatus {
  if (paidAmount <= 0) {
    return "unpaid";
  }

  if (paidAmount >= grandTotal) {
    return "paid";
  }

  return "partial";
}

const INVOICE_PAYMENT_STATUS_THEMES = {
  unpaid: {
    label: "Unpaid",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    glowCore: "rgba(244, 63, 94, 0.15)",
    glowMid: "rgba(251, 113, 133, 0.05)",
  },
  partial: {
    label: "Partial",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    glowCore: "rgba(245, 158, 11, 0.17)",
    glowMid: "rgba(251, 191, 36, 0.06)",
  },
  paid: {
    label: "Paid",
    className: "border-green-200 bg-green-50 text-green-700",
    glowCore: "rgba(34, 197, 94, 0.17)",
    glowMid: "rgba(74, 222, 128, 0.06)",
  },
} as const;

export function getInvoicePaymentStatusStyle(status: string) {
  if (status in INVOICE_PAYMENT_STATUS_THEMES) {
    const theme =
      INVOICE_PAYMENT_STATUS_THEMES[
        status as keyof typeof INVOICE_PAYMENT_STATUS_THEMES
      ];

    return {
      label: theme.label,
      className: theme.className,
    };
  }

  return {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "border-border-soft bg-surface-muted text-muted",
  };
}

export function getInvoicePaymentStatusCardGlow(status: string) {
  const theme =
    status in INVOICE_PAYMENT_STATUS_THEMES
      ? INVOICE_PAYMENT_STATUS_THEMES[
          status as keyof typeof INVOICE_PAYMENT_STATUS_THEMES
        ]
      : {
          glowCore: "rgba(161, 161, 170, 0.1)",
          glowMid: "rgba(212, 212, 216, 0.04)",
        };

  return {
    backgroundImage: `radial-gradient(ellipse 150% 95% at 50% 108%, ${theme.glowCore} 0%, ${theme.glowMid} 38%, transparent 68%)`,
  };
}

export function invoiceDetailToDraft(
  detail: InvoiceDetail,
  fallbackTerms: string,
): CreateInvoiceInput {
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
          } satisfies InvoiceLineItemDraft;
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
      invoiceTerms: detail.notes ?? fallbackTerms,
      dueDate: detail.dueDate ?? defaultInvoiceDueDate(),
    },
  };
}

export function quotationDetailToInvoiceDraft(
  detail: QuotationDetail,
  fallbackTerms: string,
): CreateInvoiceInput {
  const customer = detail.customer;

  const items = detail.items.map((item) => {
    const isLumpSum = item.unitType === "lump_sum";
    const { description, notes } = parseQuotationItemNotes(item.notes);

    return {
      id: crypto.randomUUID(),
      name: item.description,
      description,
      unitType: isLumpSum ? "sq_ft" : item.unitType,
      quantity: isLumpSum ? "" : String(item.quantity),
      rate: isLumpSum ? "" : String(item.rate),
      amount: isLumpSum ? String(item.amount) : "",
      notes,
      isLumpSum,
    } satisfies InvoiceLineItemDraft;
  });

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
      invoiceTerms: fallbackTerms,
      dueDate: defaultInvoiceDueDate(),
    },
  };
}