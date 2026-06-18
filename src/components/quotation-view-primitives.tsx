"use client";

import { Pencil } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const quotationSectionClass =
  "rounded-xl border border-border-soft bg-surface-raised/50 p-4";

type QuotationViewSectionProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  onEdit?: () => void;
  editLabel?: string;
  className?: string;
};

export function QuotationViewSection({
  icon: Icon,
  title,
  children,
  onEdit,
  editLabel = "Edit",
  className = "",
}: QuotationViewSectionProps) {
  return (
    <section className={`mt-4 ${quotationSectionClass} ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="text-muted" size={16} />
          <span>{title}</span>
        </div>
        {onEdit ? (
          <button
            aria-label={editLabel}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
            onClick={onEdit}
            type="button"
          >
            <Pencil size={15} />
          </button>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function QuotationViewDivider() {
  return (
    <div aria-hidden className="my-3 border-t border-dashed border-border-soft" />
  );
}

type QuotationViewLabelValueProps = {
  label: string;
  value: string;
};

export function QuotationViewLabelValue({
  label,
  value,
}: QuotationViewLabelValueProps) {
  if (!value.trim()) {
    return null;
  }

  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {value}
      </p>
    </div>
  );
}