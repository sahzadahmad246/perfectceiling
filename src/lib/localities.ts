
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
  if (input.faqs?.some((faq) => !faq.question?.trim() || !faq.answer?.trim())) return "Each FAQ needs a question and answer.";
  return null;
}
