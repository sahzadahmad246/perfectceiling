"use server";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(formData?: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=supabase-env");
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const nextValue = formData?.get("next");
  const next =
    typeof nextValue === "string" && nextValue.startsWith("/")
      ? nextValue
      : "/admin";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut(formData?: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  const nextValue = formData?.get("next");
  const next =
    typeof nextValue === "string" && nextValue.startsWith("/")
      ? nextValue
      : "/login";

  await supabase.auth.signOut();
  redirect(next);
}
