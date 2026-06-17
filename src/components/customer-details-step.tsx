"use client";

import { MapPin, NotebookPen, Phone, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { PhoneInput } from "@/components/phone-input";
import type { CustomerFieldErrors } from "@/lib/customer-validation";
import type { QuotationCustomerDraft } from "@/lib/quotations";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 h-11 w-full rounded-md border bg-surface px-3 text-sm outline-none transition focus:border-primary";

const textareaClass =
  "mt-2 w-full rounded-md border bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

type CustomerDetailsStepProps = {
  customer: QuotationCustomerDraft;
  errors: CustomerFieldErrors;
  onChange: <K extends keyof QuotationCustomerDraft>(
    key: K,
    value: QuotationCustomerDraft[K],
  ) => void;
};

type FieldProps = {
  icon: LucideIcon;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

function CustomerField({
  icon: Icon,
  label,
  required = false,
  error,
  children,
}: FieldProps) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="text-muted" size={16} />
        <span>
          {label}
          {required ? <span className="text-rose-500"> *</span> : null}
        </span>
        {!required ? (
          <span className="text-xs font-normal text-muted">Optional</span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p className="my-2 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

export function CustomerDetailsStep({
  customer,
  errors,
  onChange,
}: CustomerDetailsStepProps) {
  return (
    <div>
      <CustomerField
        error={errors.name}
        icon={UserRound}
        label="Customer name"
        required
      >
        <input
          aria-invalid={Boolean(errors.name)}
          className={cn(
            inputClass,
            errors.name ? "border-rose-400" : "border-border-strong",
          )}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="Enter customer name"
          value={customer.name}
        />
      </CustomerField>

      <CustomerField
        error={errors.phone}
        icon={Phone}
        label="Mobile number"
        required
      >
        <PhoneInput
          error={errors.phone}
          onChange={(value) => onChange("phone", value)}
          value={customer.phone}
        />
      </CustomerField>

      <CustomerField
        error={errors.address}
        icon={MapPin}
        label="Address"
        required
      >
        <textarea
          aria-invalid={Boolean(errors.address)}
          className={cn(
            `${textareaClass} min-h-24`,
            errors.address ? "border-rose-400" : "border-border-strong",
          )}
          onChange={(event) => onChange("address", event.target.value)}
          placeholder="House no., street, area, city"
          value={customer.address}
        />
      </CustomerField>

      <CustomerField icon={NotebookPen} label="Notes">
        <textarea
          className={`${textareaClass} min-h-24 border-border-strong`}
          onChange={(event) => onChange("notes", event.target.value)}
          placeholder="Any extra details for this customer"
          value={customer.notes}
        />
      </CustomerField>
    </div>
  );
}