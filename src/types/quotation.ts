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
  rejectionReason?: string;
  customerNote?: string;
  sharing?: {
    isShared: boolean;
    shareToken: string | null;
    sharedAt: string | null;
    sharedBy: string | null;
    accessCount: number;
    lastAccessedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// Extended quotation type with sharing information
export interface QuotationWithSharing extends QuotationListItem {
  sharing: {
    isShared: boolean;
    shareToken: string | null;
    sharedAt: string | null;
    sharedBy: string | null;
    accessCount: number;
    lastAccessedAt: string | null;
  };
}

// Sharing-related types
export interface ShareUrlResponse {
  success: boolean;
  shareUrl: string;
  token: string;
  expiresAt?: string; // Future enhancement
}

export interface VerificationRequest {
  phoneDigits: string; // Last 4 digits
}

export interface VerificationResponse {
  success: boolean;
  quotation?: QuotationListItem;
  error?: string;
  remainingAttempts?: number;
}

export interface ShareStatusResponse {
  isShared: boolean;
  shareUrl?: string;
  sharedAt?: string;
  sharedBy?: string;
  accessCount: number;
  lastAccessedAt?: string;
}

export interface ErrorResponse {
  error: string;
  code: 'INVALID_TOKEN' | 'VERIFICATION_FAILED' | 'RATE_LIMITED' | 'NOT_FOUND' | 'SERVER_ERROR';
  details?: string;
  remainingAttempts?: number;
}