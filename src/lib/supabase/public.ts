import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { hasSupabaseEnv } from "@/lib/env";

export function createPublicClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}