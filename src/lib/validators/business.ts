import { z } from "zod";

export const BusinessSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  primaryPhone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  secondaryPhone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || (val.length === 10 && /^\d+$/.test(val)), {
      message: "Secondary phone must be exactly 10 digits",
    }),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),
  status: z.enum([
    "open",
    "closed",
    "temporary_closed",
    "busy",
    "holiday",
    "by_appointment",
    "maintenance",
  ]),
  terms: z.array(z.string().max(200, "Term must be 200 characters or less")).default([]),
  logoUrl: z.string().optional().or(z.literal("")),
  logoPublicId: z.string().optional().or(z.literal("")),
});

export type BusinessSettingsFormValues = z.infer<typeof BusinessSettingsSchema>;
