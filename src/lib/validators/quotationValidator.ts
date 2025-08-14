// lib/validators/quotationValidator.ts
import { z } from "zod";

export const QuotationItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  area: z.number().min(0, "Area must be non-negative"),
  unit: z.enum(["sqft", "runningft"]),
  rate: z.number().min(0, "Rate must be non-negative"),
  total: z.number().min(0, "Item total must be non-negative"),
});

export const QuotationSchema = z.object({
  clientInfo: z.object({
    name: z.string().min(1, "Client name is required"),
    phone: z.string().min(1, "Client phone is required"),
    address: z.string().min(1, "Client address is required"),
  }),
  workDetails: z.object({
    items: z.array(QuotationItemSchema).min(1, "At least one item is required"),
    total: z.number().min(0, "Total must be non-negative"),
    discount: z.number().min(0, "Discount must be non-negative"),
    grandTotal: z.number().min(0, "Grand total must be non-negative"),
    notes: z.string(),
  }),
  status: z.enum(["accepted", "pending", "rejected"]),
});

// Infer the type from Zod schema for perfect alignment
export type QuotationSchemaType = z.infer<typeof QuotationSchema>;