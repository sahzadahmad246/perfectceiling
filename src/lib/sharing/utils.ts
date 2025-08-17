// lib/sharing/utils.ts
import type { QuotationListItem, QuotationWithSharing } from "@/types/quotation";

/**
 * Ensures a quotation has sharing data, adding default values if missing
 */
export function ensureQuotationSharing(quotation: QuotationListItem): QuotationWithSharing {
  return {
    ...quotation,
    sharing: quotation.sharing || {
      isShared: false,
      shareToken: null,
      sharedAt: null,
      sharedBy: null,
      accessCount: 0,
      lastAccessedAt: null,
    },
  };
}

/**
 * Ensures all quotations in an array have sharing data
 */
export function ensureQuotationsSharing(quotations: QuotationListItem[]): QuotationWithSharing[] {
  return quotations.map(ensureQuotationSharing);
}