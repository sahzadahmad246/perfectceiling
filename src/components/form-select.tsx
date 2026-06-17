"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type FormSelectOption<T extends string> = {
  value: T;
  label: string;
};

type FormSelectProps<T extends string> = {
  value: T;
  options: FormSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
};

export function FormSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: FormSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

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
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-border-strong bg-surface text-foreground transition hover:bg-surface-muted",
          size === "sm" ? "h-7 px-2 text-xs font-medium" : "h-9 px-3 text-sm",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{selected.label}</span>
        <ChevronDown
          className={cn("text-muted transition", open && "rotate-180")}
          size={size === "sm" ? 12 : 14}
        />
      </button>

      {open ? (
        <div
          className="animate-menu-pop absolute right-0 top-[calc(100%+6px)] z-50 min-w-full overflow-hidden rounded-lg border border-border-soft bg-surface-raised p-1 shadow-popover"
          role="listbox"
        >
          {options.map((option) => (
            <button
              aria-selected={option.value === value}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition hover:bg-surface-muted",
                option.value === value && "bg-surface-muted",
                size === "sm" && "text-xs",
              )}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              role="option"
              type="button"
            >
              <span>{option.label}</span>
              {option.value === value ? (
                <Check className="text-primary" size={14} />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}