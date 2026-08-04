"use client";

import { Check, ChevronDown, MapPin, NotebookPen, Phone, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { PhoneInput } from "@/components/phone-input";
import type { CustomerFieldErrors } from "@/lib/customer-validation";
import {
  CUSTOMER_TITLE_OPTIONS,
  type CustomerTitle,
  type QuotationCustomerDraft,
} from "@/lib/quotations";
import { cn } from "@/lib/utils";

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

type CustomerNameInputProps = {
  title: string;
  name: string;
  error?: string;
  onTitleChange: (title: CustomerTitle) => void;
  onNameChange: (name: string) => void;
};

function CustomerNameInput({
  title,
  name,
  error,
  onTitleChange,
  onNameChange,
}: CustomerNameInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedTitle =
    CUSTOMER_TITLE_OPTIONS.find((option) => option.value === title) ??
    CUSTOMER_TITLE_OPTIONS[0];

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className="relative mt-2" ref={containerRef}>
      <div
        className={cn(
          "flex h-11 items-stretch rounded-md border bg-surface transition focus-within:border-primary",
          error ? "border-rose-400" : "border-border-strong",
        )}
      >
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Select customer title"
          className="flex shrink-0 items-center gap-1.5 rounded-l-md px-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className={cn(!selectedTitle.value && "text-muted")}>
            {selectedTitle.value || "Title"}
          </span>
          <ChevronDown
            className={cn("text-muted transition", open && "rotate-180")}
            size={14}
          />
        </button>

        <div aria-hidden className="w-px self-stretch bg-border-strong" />

        <input
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 rounded-r-md bg-transparent px-3 text-sm outline-none"
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Enter customer name"
          value={name}
        />
      </div>

      {open ? (
        <div
          className="animate-menu-pop absolute left-0 top-[calc(100%+8px)] z-50 min-w-[10rem] overflow-hidden rounded-xl border border-border-soft bg-surface-raised p-1.5 shadow-popover"
          role="listbox"
        >
          {CUSTOMER_TITLE_OPTIONS.map((option) => {
            const isSelected = option.value === selectedTitle.value;

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-surface-muted",
                  isSelected && "bg-surface-muted",
                )}
                key={option.value || "no-title"}
                onClick={() => {
                  onTitleChange(option.value);
                  setOpen(false);
                }}
                role="option"
                type="button"
              >
                <span className={cn(!option.value && "text-muted")}>
                  {option.label}
                </span>
                {isSelected ? (
                  <Check className="text-primary" size={14} />
                ) : null}
              </button>
            );
          })}
        </div>
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
        <CustomerNameInput
          error={errors.name}
          name={customer.name}
          onNameChange={(value) => onChange("name", value)}
          onTitleChange={(title) => onChange("title", title)}
          title={customer.title ?? ""}
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
