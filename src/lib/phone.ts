export type PhoneCountry = {
  code: string;
  name: string;
  dialCode: string;
  digits: number;
  flag: string;
};

export const OTHER_PHONE_COUNTRY: PhoneCountry = {
  code: "OTHER",
  name: "Other",
  dialCode: "",
  digits: 15,
  flag: "🌐",
};

export const OTHER_PHONE_MIN_DIGITS = 6;

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "IN", name: "India", dialCode: "+91", digits: 10, flag: "🇮🇳" },
  { code: "AE", name: "UAE", dialCode: "+971", digits: 9, flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", digits: 9, flag: "🇸🇦" },
  { code: "QA", name: "Qatar", dialCode: "+974", digits: 8, flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", dialCode: "+965", digits: 8, flag: "🇰🇼" },
  { code: "OM", name: "Oman", dialCode: "+968", digits: 8, flag: "🇴🇲" },
  { code: "BH", name: "Bahrain", dialCode: "+973", digits: 8, flag: "🇧🇭" },
  { code: "US", name: "United States", dialCode: "+1", digits: 10, flag: "🇺🇸" },
  { code: "CA", name: "Canada", dialCode: "+1", digits: 10, flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", digits: 10, flag: "🇬🇧" },
  { code: "AU", name: "Australia", dialCode: "+61", digits: 9, flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", digits: 9, flag: "🇳🇿" },
  { code: "DE", name: "Germany", dialCode: "+49", digits: 11, flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", digits: 9, flag: "🇫🇷" },
  { code: "IT", name: "Italy", dialCode: "+39", digits: 10, flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", digits: 9, flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", dialCode: "+31", digits: 9, flag: "🇳🇱" },
  { code: "IE", name: "Ireland", dialCode: "+353", digits: 9, flag: "🇮🇪" },
  { code: "CH", name: "Switzerland", dialCode: "+41", digits: 9, flag: "🇨🇭" },
  { code: "SE", name: "Sweden", dialCode: "+46", digits: 9, flag: "🇸🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", digits: 8, flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dialCode: "+45", digits: 8, flag: "🇩🇰" },
  { code: "BE", name: "Belgium", dialCode: "+32", digits: 9, flag: "🇧🇪" },
  { code: "AT", name: "Austria", dialCode: "+43", digits: 10, flag: "🇦🇹" },
  { code: "PT", name: "Portugal", dialCode: "+351", digits: 9, flag: "🇵🇹" },
  { code: "PL", name: "Poland", dialCode: "+48", digits: 9, flag: "🇵🇱" },
  { code: "SG", name: "Singapore", dialCode: "+65", digits: 8, flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", dialCode: "+60", digits: 10, flag: "🇲🇾" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", digits: 8, flag: "🇭🇰" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", digits: 10, flag: "🇧🇩" },
  { code: "NP", name: "Nepal", dialCode: "+977", digits: 10, flag: "🇳🇵" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", digits: 9, flag: "🇱🇰" },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

const countriesByDialLength = [...PHONE_COUNTRIES].sort(
  (left, right) => right.dialCode.length - left.dialCode.length,
);

export function getPhoneCountryByDialCode(dialCode: string) {
  return (
    PHONE_COUNTRIES.find((country) => country.dialCode === dialCode) ??
    DEFAULT_PHONE_COUNTRY
  );
}

export function sanitizeNationalNumber(value: string, maxDigits: number) {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

export function normalizeCustomDialCode(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "+";
  }

  const digits = trimmed.replace(/[^\d]/g, "");
  return digits ? `+${digits.slice(0, 4)}` : "+";
}

export function formatPhoneNumber(
  country: PhoneCountry,
  nationalNumber: string,
  customDialCode = "+",
) {
  const maxDigits = country.code === "OTHER" ? 15 : country.digits;
  const digits = sanitizeNationalNumber(nationalNumber, maxDigits);
  const dialCode =
    country.code === "OTHER"
      ? normalizeCustomDialCode(customDialCode)
      : country.dialCode;

  if (!digits || dialCode === "+") {
    return "";
  }

  return `${dialCode} ${digits}`;
}

export function parsePhoneNumber(value: string, preferredCountry = DEFAULT_PHONE_COUNTRY) {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      country: preferredCountry,
      nationalNumber: "",
      customDialCode: "+",
    };
  }

  if (trimmed.startsWith("+")) {
    for (const country of countriesByDialLength) {
      if (trimmed.startsWith(country.dialCode)) {
        const nationalNumber = sanitizeNationalNumber(
          trimmed.slice(country.dialCode.length),
          country.digits,
        );

        return { country, nationalNumber, customDialCode: "+" };
      }
    }

    const otherMatch = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);

    if (otherMatch) {
      return {
        country: OTHER_PHONE_COUNTRY,
        nationalNumber: sanitizeNationalNumber(otherMatch[2] ?? "", 15),
        customDialCode: otherMatch[1] ?? "+",
      };
    }
  }

  const digitsOnly = sanitizeNationalNumber(trimmed, 15);

  if (digitsOnly.length === DEFAULT_PHONE_COUNTRY.digits) {
    return {
      country: DEFAULT_PHONE_COUNTRY,
      nationalNumber: digitsOnly,
      customDialCode: "+",
    };
  }

  if (
    digitsOnly.startsWith("91") &&
    digitsOnly.length === DEFAULT_PHONE_COUNTRY.digits + 2
  ) {
    return {
      country: DEFAULT_PHONE_COUNTRY,
      nationalNumber: digitsOnly.slice(2),
      customDialCode: "+",
    };
  }

  return {
    country: preferredCountry,
    nationalNumber: digitsOnly.slice(0, preferredCountry.digits),
    customDialCode: "+",
  };
}

export function validatePhoneNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      valid: false as const,
      error: "Mobile number is required.",
    };
  }

  const { country, nationalNumber, customDialCode } = parsePhoneNumber(trimmed);

  if (!nationalNumber) {
    return {
      valid: false as const,
      error: "Enter a valid mobile number.",
    };
  }

  if (country.code === "OTHER") {
    const dialCode = normalizeCustomDialCode(customDialCode ?? "+");

    if (!/^\+\d{1,4}$/.test(dialCode)) {
      return {
        valid: false as const,
        error: "Enter a valid country code like +1 or +971.",
      };
    }

    if (nationalNumber.length < OTHER_PHONE_MIN_DIGITS) {
      return {
        valid: false as const,
        error: `Enter at least ${OTHER_PHONE_MIN_DIGITS} digits for the mobile number.`,
      };
    }

    return {
      valid: true as const,
      formatted: formatPhoneNumber(country, nationalNumber, dialCode),
    };
  }

  if (nationalNumber.length !== country.digits) {
    return {
      valid: false as const,
      error: `Enter a ${country.digits}-digit number for ${country.name}.`,
    };
  }

  return {
    valid: true as const,
    formatted: formatPhoneNumber(country, nationalNumber),
  };
}