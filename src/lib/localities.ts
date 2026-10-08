
export type LocalityPage = {
  id: string; name: string; city: string; city_slug: string; slug: string;
  intro: string; content: string; local_details: string; seo_title: string; seo_description: string;
  service_ids: string[]; project_ids: string[]; faqs: { question: string; answer: string }[];
  published: boolean; updated_at: string;
};
export function localityPath(page: Pick<LocalityPage, "city_slug" | "slug">) {
  return `/areas/${page.city_slug}${page.slug ? `/${page.slug}` : ""}`;
}
export function validateLocality(input: Partial<LocalityPage>) {
  if (!input.name?.trim() || !input.city?.trim()) return "Enter the locality name and city.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.city_slug ?? "") || (input.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug))) return "Use lowercase letters, numbers and hyphens in URL slugs.";
  if (input.published && (!input.intro?.trim() || !input.content?.trim() || !input.local_details?.trim() || !input.service_ids?.length)) return "Published pages need an introduction, useful content, actual local details and at least one service.";
  if (input.published && input.faqs?.some((faq) => !faq.question?.trim() || !faq.answer?.trim())) return "Each FAQ needs a question and answer.";
  return null;
}

export function slugifyLocalityName(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/g, "");
}
export function getLocalityServices<T extends { id: string; slug: string }>(page: Pick<LocalityPage, "service_ids">, services: T[]) {
  return services.filter(service => page.service_ids.includes(service.id));
}
export function selectLocalityService<T extends { id: string; slug: string }>(page: Pick<LocalityPage, "service_ids">, services: T[], slug?: string) {
  return getLocalityServices(page, services).find(service => service.slug === slug);
}
export function localityInquiry(page: Pick<LocalityPage, "name" | "city" | "slug">, service?: string) {
  const place = page.slug ? `${page.name}, ${page.city}` : page.name;
  return `Hi, I'd like a quotation ${service ? `for ${service} ` : "for ceiling and interior work "}in ${place}.`;
}
