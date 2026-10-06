"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getAuthRedirectPath } from "@/lib/auth/redirect";
import { hasSupabaseEnv } from "@/lib/env";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(formData?: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=supabase-env");
  }

  const supabase = await createClient();
  // The PKCE verifier cookie belongs to the host where sign-in started.
  // Next.js validates Server Action Origin against Host before running this action.
  const origin = (await headers()).get("origin");
  const siteUrl = origin ? new URL(origin).origin : getSiteUrl();
  const nextValue = formData?.get("next");
  const next = getAuthRedirectPath(nextValue);

  // Keep the default callback exact so it matches the Supabase redirect allow list.
  const callback = new URL("/auth/callback", siteUrl);
  if (next !== "/admin") callback.searchParams.set("next", next);
  const redirectTo = callback.toString();

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
  const next = getAuthRedirectPath(nextValue, "/login");

  await supabase.auth.signOut();
  redirect(next);
}
