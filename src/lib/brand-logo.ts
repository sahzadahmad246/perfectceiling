export const BRAND_LOGO_FALLBACK = "/logo.png";

export function getBrandLogoUrl(logoUrl?: string | null) {
  return logoUrl?.trim() || BRAND_LOGO_FALLBACK;
}