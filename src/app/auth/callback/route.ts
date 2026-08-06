import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { upsertProfile } from "@/lib/auth/profile";
import { getRequiredEnv } from "@/lib/env";
import { getSiteUrl } from "@/lib/site-url";

function resolveRedirectBase(request: Request) {
  const { origin } = new URL(request.url);
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return origin;
  }

  // Prefer configured production URL so OAuth cookies land on the real domain.
  const siteUrl = getSiteUrl();
  if (siteUrl.startsWith("https://") || siteUrl.startsWith("http://")) {
    return siteUrl;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }

  return origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/admin";

  if (!next.startsWith("/")) {
    next = "/admin";
  }

  const base = resolveRedirectBase(request);

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
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(error.message.slice(0, 80))}`,
    );
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
