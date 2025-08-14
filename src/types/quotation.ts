// types/quotation.ts
export interface QuotationItem {
  description: string;
  area: number;
  unit: "sqft" | "runningft";
  rate: number;
  total: number;
}

export interface QuotationFormData {
  clientInfo: {
    name: string;
    phone: string;
    address: string;
  };
  workDetails: {
    items: QuotationItem[];
    total: number;
    discount: number;
    grandTotal: number;
    notes: string;
  };
  status: "accepted" | "pending" | "rejected";
}

// API response type for listing quotations
export interface QuotationListItem {
  id: string;
  clientInfo: {
    name: string;
    phone: string;
    address: string;
  };
  workDetails: {
    items: QuotationItem[];
    total: number;
    discount: number;
    grandTotal: number;
    notes: string;
  };
  status: "accepted" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
}