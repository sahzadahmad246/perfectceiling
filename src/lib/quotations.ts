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

export type QuotationWorkDraft = {
  workTitle: string;
  items: QuotationLineItemDraft[];
  discount: string;
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

export function calculateGrandTotal(subtotal: number, discountValue: string) {
  const discount = Math.max(0, parseNumber(discountValue));

  return Math.max(0, subtotal - discount);
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