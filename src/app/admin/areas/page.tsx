import { requireAdmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/admin";
import { getPublicServices, getAllPublicProjects } from "@/lib/public-content";
import { LocalityEditor } from "./editor";
export default async function Page() {
  await requireAdmin();
  const client = createServiceClient();
  const [result, services, projects] = await Promise.all([client?.from("locality_pages").select("*").order("city").order("name"), getPublicServices(), getAllPublicProjects()]);
  return <section className="py-6"><h1 className="text-2xl font-medium">Locality pages</h1><p className="mt-2 text-sm text-muted">Create city pages first, then add useful locality pages with actual local information.</p>{!client || result?.error ? <p role="alert" className="my-4 text-sm text-red-700">Run the locality migration and configure SUPABASE_SERVICE_ROLE_KEY to enable this editor.</p> : null}<LocalityEditor pages={result?.data ?? []} services={services.filter(s => !s.id.startsWith("fallback-"))} projects={projects} /></section>;
}
