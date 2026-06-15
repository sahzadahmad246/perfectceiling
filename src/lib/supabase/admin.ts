import { createClient } from "@supabase/supabase-js";

import { getRequiredEnv } from "@/lib/env";

export function hasServiceRoleEnv() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return null;
  }

  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}