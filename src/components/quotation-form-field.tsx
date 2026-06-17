"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type QuotationFormFieldProps = {
  icon: LucideIcon;
  label: string;
  required?: boolean;
  optional?: boolean;
  compact?: boolean;
  error?: string;
  children: ReactNode;
};

export function QuotationFormField({
  icon: Icon,
  label,
  required = false,
  optional = false,
  compact = false,
  error,
  children,
}: QuotationFormFieldProps) {
  return (
    <div className={compact ? "mb-3 last:mb-0" : "mb-5 last:mb-0"}>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="text-muted" size={16} />
        <span>
          {label}
          {required ? <span className="text-rose-500"> *</span> : null}
        </span>
        {optional ? (
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