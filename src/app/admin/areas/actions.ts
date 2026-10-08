"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { validateLocality, type LocalityPage } from "@/lib/localities";

export async function saveLocality(input: Partial<LocalityPage>) {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid().optional(), name: z.string().max(160), city: z.string().max(100), city_slug: z.string().max(100), slug: z.string().max(100).optional(), intro: z.string().max(2000).optional(), content: z.string().max(30000).optional(), local_details: z.string().max(10000).optional(), seo_title: z.string().max(250).optional(), seo_description: z.string().max(1000).optional(), service_ids: z.array(z.uuid()).max(50).optional(), project_ids: z.array(z.uuid()).max(100).optional(), faqs: z.array(z.object({ question: z.string().max(500), answer: z.string().max(4000) })).max(30).optional(), published: z.boolean().optional(), updated_at: z.string().optional() }).safeParse(input);
  if (!parsed.success) return { error: "Invalid page data. Check field lengths and selected records." };
  input = parsed.data;
  const error = validateLocality(input);
  if (error) return { error };
  const client = createServiceClient();
  if (!client) return { error: "Set the server-only SUPABASE_SERVICE_ROLE_KEY in Vercel to manage locality pages." };
  if (input.id) {
    const previous = await client.from("locality_pages").select("city_slug,slug,published").eq("id", input.id).single();
    if (previous.error) return { error: "This locality page no longer exists." };
    if (Boolean(previous.data.slug) !== Boolean(input.slug)) return { error: "A saved city/locality page keeps its type. Create a new page to use another type." };
    if (!previous.data.slug && previous.data.city_slug !== input.city_slug) {
      const children = await client.from("locality_pages").select("id").eq("city_slug", previous.data.city_slug).neq("slug", "").limit(1);
      if (children.error) return { error: "Could not check this city's locality pages. Please retry." };
      if (children.data?.length) return { error: "Keep the city URL unchanged while it has locality pages." };
    }
    if (previous.data.published && (previous.data.city_slug !== input.city_slug || previous.data.slug !== (input.slug || ""))) return { error: "Keep a published page's URL unchanged to preserve existing links." };
    if (!previous.data.slug && !input.published) {
      const children = await client.from("locality_pages").select("id").eq("city_slug", previous.data.city_slug).neq("slug", "").eq("published", true).limit(1);
      if (children.error) return { error: "Could not check this city’s published localities. Please retry." };
      if (children.data?.length) return { error: "Unpublish this city's locality pages before unpublishing the city page." };
    }
  }
  if (input.published && input.slug) {
    const parent = await client.from("locality_pages").select("id").eq("city_slug", input.city_slug!).eq("slug", "").eq("published", true).maybeSingle();
    if (!parent.data) return { error: "Publish the city page before publishing a locality beneath it." };
  }
  if (input.published) {
    const available = await client.from("services").select("id").in("id", input.service_ids || []).eq("published", true);
    if (available.error || available.data.length !== input.service_ids?.length) return { error: "Select currently published services before publishing this page." };
  }
  if (input.published && input.project_ids?.length) {
    const projects = await client.from("projects").select("id").in("id", input.project_ids).eq("published", true).eq("status", "completed");
    if (projects.error || projects.data.length !== input.project_ids.length) return { error: "Select currently published, completed projects before publishing this page." };
  }
  const row = { name: input.name!.trim(), city: input.city!.trim(), city_slug: input.city_slug, slug: input.slug || "", intro: input.intro?.trim() || "", content: input.content?.trim() || "", local_details: input.local_details?.trim() || "", seo_title: input.seo_title?.trim() || "", seo_description: input.seo_description?.trim() || "", service_ids: input.service_ids || [], project_ids: input.project_ids || [], faqs: input.faqs || [], published: Boolean(input.published), updated_at: new Date().toISOString() };
  const result = input.id ? await client.from("locality_pages").update(row).eq("id", input.id).select("id").single() : await client.from("locality_pages").insert(row).select("id").single();
  if (result.error) return { error: result.error.code === "23505" ? "That city/locality URL already exists." : "Could not save. Check the locality migration and selected services/projects." };
  revalidatePath("/areas", "layout"); revalidatePath("/sitemap.xml"); revalidatePath("/admin/areas");
  return { id: result.data.id };
}
export async function deleteLocality(id: string) {
  await requireAdmin();
  const client = createServiceClient();
  if (!client) return { error: "Missing server-only service role key." };
  const previous = await client.from("locality_pages").select("city_slug,slug").eq("id", id).single();
  if (previous.error) return { error: "This locality page no longer exists." };
  if (!previous.data.slug) {
    const children = await client.from("locality_pages").select("id").eq("city_slug", previous.data.city_slug).neq("slug", "").limit(1);
    if (children.error) return { error: "Could not check this city’s localities. Please retry." };
    if (children.data?.length) return { error: "Delete this city's locality pages before deleting its city page." };
  }
  const { error } = await client.from("locality_pages").delete().eq("id", id);
  if (error) return { error: "Could not delete locality page." };
  revalidatePath("/areas", "layout"); revalidatePath("/sitemap.xml"); revalidatePath("/admin/areas");
  return { success: true };
}
