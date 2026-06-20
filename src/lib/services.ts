import { formatCurrency } from "@/lib/quotations";

export type ServiceRateUnit = "sq_ft" | "running_ft" | "piece" | "lump_sum";

export const SERVICE_RATE_UNITS: Array<{
  id: ServiceRateUnit;
  label: string;
}> = [
  { id: "sq_ft", label: "Per sq ft" },
  { id: "running_ft", label: "Per running ft" },
  { id: "piece", label: "Per piece" },
  { id: "lump_sum", label: "Lump sum" },
];

export type ServiceListItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  startingPrice: number | null;
  rateUnit: ServiceRateUnit | null;
  published: boolean;
  sortOrder: number;
  seoTitle: string | null;
};

export type ServiceDetail = ServiceListItem & {
  content: string | null;
  seoDescription: string | null;
  featuredImageUrl: string | null;
};

export type ServiceFormInput = {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  startingPrice: string;
  rateUnit: ServiceRateUnit | "";
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  sortOrder: string;
};

export function slugifyServiceTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getServiceRateUnitLabel(unit: ServiceRateUnit | null | string) {
  return (
    SERVICE_RATE_UNITS.find((option) => option.id === unit)?.label ?? null
  );
}

export function formatServiceRate(
  startingPrice: number | null,
  rateUnit: ServiceRateUnit | null,
) {
  if (startingPrice === null || !Number.isFinite(startingPrice)) {
    return "Rate on request";
  }

  const unitLabel = getServiceRateUnitLabel(rateUnit);

  return unitLabel
    ? `From ${formatCurrency(startingPrice)} ${unitLabel.toLowerCase()}`
    : `From ${formatCurrency(startingPrice)}`;
}

export function getServicePublicPath(slug: string) {
  return `/services/${slug}`;
}

export function applyServiceSearch(services: ServiceListItem[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return services;
  }

  return services.filter((service) => {
    const haystack = [
      service.title,
      service.slug,
      service.shortDescription,
      service.seoTitle ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function emptyServiceForm(): ServiceFormInput {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    content: "",
    startingPrice: "",
    rateUnit: "",
    seoTitle: "",
    seoDescription: "",
    published: false,
    sortOrder: "0",
  };
}

export function serviceDetailToForm(service: ServiceDetail): ServiceFormInput {
  return {
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    content: service.content ?? "",
    startingPrice:
      service.startingPrice !== null ? String(service.startingPrice) : "",
    rateUnit: service.rateUnit ?? "",
    seoTitle: service.seoTitle ?? "",
    seoDescription: service.seoDescription ?? "",
    published: service.published,
    sortOrder: String(service.sortOrder),
  };
}