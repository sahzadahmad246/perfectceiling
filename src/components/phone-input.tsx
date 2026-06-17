"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  DEFAULT_PHONE_COUNTRY,
  formatPhoneNumber,
  normalizeCustomDialCode,
  OTHER_PHONE_COUNTRY,
  parsePhoneNumber,
  PHONE_COUNTRIES,
  sanitizeNationalNumber,
  type PhoneCountry,
} from "@/lib/phone";
import { cn } from "@/lib/utils";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
};

export function PhoneInput({ value, onChange, error, id }: PhoneInputProps) {
  const [country, setCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY);
  const [nationalNumber, setNationalNumber] = useState("");
  const [customDialCode, setCustomDialCode] = useState("+");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOther = country.code === "OTHER";

  useEffect(() => {
    const parsed = parsePhoneNumber(value);
    setCountry(parsed.country);
    setNationalNumber(parsed.nationalNumber);
    setCustomDialCode(parsed.customDialCode ?? "+");
  }, [value]);

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

  function updatePhone(
    nextCountry: PhoneCountry,
    nextNationalNumber: string,
    nextCustomDialCode = customDialCode,
  ) {
    const maxDigits = nextCountry.code === "OTHER" ? 15 : nextCountry.digits;
    const digits = sanitizeNationalNumber(nextNationalNumber, maxDigits);
    const dialCode = normalizeCustomDialCode(nextCustomDialCode);

    setCountry(nextCountry);
    setNationalNumber(digits);
    setCustomDialCode(dialCode);
    onChange(formatPhoneNumber(nextCountry, digits, dialCode));
  }

  function selectCountry(option: PhoneCountry) {
    if (option.code === "OTHER") {
      updatePhone(OTHER_PHONE_COUNTRY, nationalNumber, customDialCode || "+");
      setOpen(false);
      return;
    }

    updatePhone(option, nationalNumber, "+");
    setOpen(false);
  }

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
          aria-label="Select country code"
          className="flex shrink-0 items-center gap-1.5 rounded-l-md px-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden>{country.flag}</span>
          {!isOther ? <span>{country.dialCode}</span> : null}
          <ChevronDown
            className={cn("text-muted transition", open && "rotate-180")}
            size={14}
          />
        </button>

        {isOther ? (
          <input
            aria-label="Custom country code"
            className="w-16 shrink-0 bg-transparent px-2 text-sm font-medium outline-none"
            onChange={(event) =>
              updatePhone(country, nationalNumber, event.target.value)
            }
            placeholder="+00"
            value={customDialCode}
          />
        ) : null}

        <div aria-hidden className="w-px self-stretch bg-border-strong" />

        <input
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 rounded-r-md bg-transparent px-3 text-sm outline-none"
          id={id}
          inputMode="numeric"
          maxLength={isOther ? 15 : country.digits}
          onChange={(event) => updatePhone(country, event.target.value, customDialCode)}
          placeholder={
            isOther
              ? "Mobile number"
              : `${country.digits} digit number`
          }
          type="tel"
          value={nationalNumber}
        />
      </div>

      {open ? (
        <div
          className="animate-menu-pop absolute left-0 top-[calc(100%+8px)] z-50 max-h-60 w-full min-w-[16rem] overflow-y-auto rounded-xl border border-border-soft bg-surface-raised p-1.5 shadow-popover"
          role="listbox"
        >
          {PHONE_COUNTRIES.map((option) => (
            <button
              aria-selected={
                option.code === country.code && country.code !== "OTHER"
              }
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-surface-muted",
                option.code === country.code &&
                  country.code !== "OTHER" &&
                  "bg-surface-muted",
              )}
              key={option.code}
              onClick={() => selectCountry(option)}
              role="option"
              type="button"
            >
              <span aria-hidden>{option.flag}</span>
              <span className="min-w-0 flex-1 truncate">{option.name}</span>
              <span className="text-muted">{option.dialCode}</span>
            </button>
          ))}

          <button
            aria-selected={isOther}
            className={cn(
              "mt-1 flex w-full items-center gap-2 rounded-lg border-t border-border-soft px-3 py-2.5 text-left text-sm transition hover:bg-surface-muted",
              isOther && "bg-surface-muted",
            )}
            onClick={() => selectCountry(OTHER_PHONE_COUNTRY)}
            role="option"
            type="button"
          >
            <span aria-hidden>{OTHER_PHONE_COUNTRY.flag}</span>
            <span className="min-w-0 flex-1 truncate">{OTHER_PHONE_COUNTRY.name}</span>
            <span className="text-muted">Custom</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}