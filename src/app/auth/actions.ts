"use server";

import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(formData?: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=supabase-env");
  }

  const supabase = await createClient();
  const siteUrl = getSiteUrl();
  const nextValue = formData?.get("next");
  const next =
    typeof nextValue === "string" && nextValue.startsWith("/")
      ? nextValue
      : "/admin";

  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    console.error("[auth] signInWithGoogle failed", error?.message, {
      redirectTo,
    });
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
