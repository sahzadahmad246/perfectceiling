import { getPublicBusinessSettings } from "@/lib/business-settings";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { getPublicServices, getAllPublicProjects } from "@/lib/public-content";
import { LocalityEditor } from "./editor";
export default async function Page() {
  await requireAdmin();
  const client = createServiceClient();
  const [result, services, projects, settings] = await Promise.all([client?.from("locality_pages").select("*").order("city").order("name"), getPublicServices(), getAllPublicProjects(), getPublicBusinessSettings()]);
  return <section className="py-6"><p className="text-[10px] uppercase tracking-[0.14em] text-[#80603e]">Local coverage</p><h1 className="mt-2 font-primary text-3xl font-medium tracking-tight">City & locality pages</h1><p className="mt-3 text-xs leading-6 text-[#746653]">One page template, useful local details. Manage where you work and which services visitors can explore.</p>{!client || result?.error ? <p role="alert" className="my-4 text-sm text-red-700">Run the locality migration and configure SUPABASE_SERVICE_ROLE_KEY to enable this editor.</p> : null}<LocalityEditor businessName={settings.businessName} enabled={Boolean(client && !result?.error)} pages={result?.data ?? []} services={services.filter(s => !s.id.startsWith("fallback-"))} projects={projects.filter(project => project.status === "completed")} /></section>;
}
