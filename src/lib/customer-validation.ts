import { validatePhoneNumber } from "@/lib/phone";
import type { QuotationCustomerDraft } from "@/lib/quotations";

export type CustomerFieldErrors = {
  name?: string;
  phone?: string;
  address?: string;
};

export function validateQuotationCustomer(customer: QuotationCustomerDraft) {
  const errors: CustomerFieldErrors = {};

  if (!customer.name.trim()) {
    errors.name = "Customer name is required.";
  }

  if (!customer.address.trim()) {
    errors.address = "Address is required.";
  }

  const phoneValidation = validatePhoneNumber(customer.phone);

  if (!phoneValidation.valid) {
    errors.phone = phoneValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    formattedPhone: phoneValidation.valid ? phoneValidation.formatted : null,
  };
}