import { BrandLogo } from "@/components/brand-logo";
import { SiteMenuDrawer } from "@/components/site-menu-drawer";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { getAuthProfile } from "@/lib/auth/profile";
import { getAdminEmails, hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  overlay?: boolean;
  className?: string;
};

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

export async function SiteHeader({
  overlay = false,
  className,
}: SiteHeaderProps) {
  const [profile, settings] = await Promise.all([
    getCurrentProfile(),
    getPublicBusinessSettings(),
  ]);

  const isAdmin = Boolean(
    profile?.email &&
      getAdminEmails().includes(profile.email.trim().toLowerCase()),
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-30 py-3",
        overlay
          ? "bg-transparent px-4 sm:px-8"
          : "z-20 -mx-4 border-b border-border-soft bg-surface/90 px-4 backdrop-blur-xl sm:-mx-8 sm:px-8",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <BrandLogo
          businessName={settings.businessName}
          logoUrl={settings.logoUrl}
        />

        <SiteMenuDrawer isAdmin={isAdmin} overlay={overlay} profile={profile} />
      </div>
    </header>
  );
}