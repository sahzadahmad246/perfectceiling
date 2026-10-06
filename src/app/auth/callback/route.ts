import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { upsertProfile } from "@/lib/auth/profile";
import { getAuthRedirectPath } from "@/lib/auth/redirect";
import { getRequiredEnv } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams, origin: base } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getAuthRedirectPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${base}/login?error=callback-missing-code`);
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(`${base}${next}`);

  // Set session cookies on the redirect response (required on Vercel / production).
  const supabase = createServerClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed", error.message);
    // Preserve cookie updates (including removal of the used PKCE verifier).
    response.headers.set("Location", `${base}/login?error=oauth-exchange`);
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await upsertProfile(supabase, user);
    } catch (profileError) {
      console.error("[auth/callback] upsertProfile failed", profileError);
    }
  }

  return response;
}
