import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { LocalityPage } from "./localities";
export const getPublishedLocalities = cache(async (): Promise<LocalityPage[]> => {
  const client = createPublicClient();
  if (!client) return [];
  const { data, error } = await client.from("locality_pages").select("*").eq("published", true).order("city").order("name");
  if (error) { console.error("Locality pages unavailable:", error.code); return []; }
  return data ?? [];
});
