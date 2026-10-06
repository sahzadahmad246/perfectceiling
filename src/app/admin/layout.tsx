import { AdminBottomNav } from "@/components/admin-bottom-nav";
import type { Metadata } from "next";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
import { AdminHeader } from "@/components/admin-header";
import { requireAdmin } from "@/lib/auth/admin";
import { getAuthProfile } from "@/lib/auth/profile";
import { getPublicBusinessSettings } from "@/lib/business-settings";

export const metadata: Metadata = { robots: NON_INDEXABLE_ROBOTS };

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ supabase, user }, settings] = await Promise.all([
    requireAdmin(),
    getPublicBusinessSettings(),
  ]);
  const profile = await getAuthProfile(supabase, user);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-24 pt-2 text-foreground sm:px-8">
      <AdminHeader
        businessName={settings.businessName}
        logoUrl={settings.logoUrl}
        profile={profile}
      />

      {children}
      <AdminBottomNav />
    </main>
  );
}
