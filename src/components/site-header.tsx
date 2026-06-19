import { LogIn } from "lucide-react";
import Link from "next/link";

import { signInWithGoogle } from "@/app/auth/actions";
import { BrandLogo } from "@/components/brand-logo";
import { UserMenu } from "@/components/user-menu";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { getAuthProfile } from "@/lib/auth/profile";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

async function getCurrentProfile() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user ? getAuthProfile(supabase, user) : null;
  } catch {
    return null;
  }
}

export async function SiteHeader() {
  const [profile, settings] = await Promise.all([
    getCurrentProfile(),
    getPublicBusinessSettings(),
  ]);

  return (
    <header className="sticky top-0 z-20 -mx-6 border-b border-border-soft bg-surface/90 px-6 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
      <div className="mx-auto flex max-w-[560px] items-center justify-between">
        <BrandLogo
          businessName={settings.businessName}
          logoUrl={settings.logoUrl}
        />

        <div className="flex items-center">
          {profile ? (
            <UserMenu profile={profile} />
          ) : (
            <form action={signInWithGoogle}>
              <input name="next" type="hidden" value="/" />
              <button
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-5 text-sm font-medium text-foreground transition duration-200 hover:border-primary"
                type="submit"
              >
                <LogIn size={16} />
                Login
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
