import { BrandLogo } from "@/components/brand-logo";
import { SiteMenuDrawer } from "@/components/site-menu-drawer";
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
    <header className="sticky top-0 z-20 -mx-4 border-b border-border-soft bg-surface/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
      <div className="flex items-center justify-between">
        <BrandLogo
          businessName={settings.businessName}
          logoUrl={settings.logoUrl}
        />

        <div className="flex items-center">
          {profile ? <UserMenu profile={profile} /> : <SiteMenuDrawer />}
        </div>
      </div>
    </header>
  );
}
