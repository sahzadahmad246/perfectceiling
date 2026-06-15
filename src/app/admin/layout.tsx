import { AdminBottomNav } from "@/components/admin-bottom-nav";
import { AdminHeader } from "@/components/admin-header";
import { requireAdmin } from "@/lib/auth/admin";
import { getAuthProfile } from "@/lib/auth/profile";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { supabase, user } = await requireAdmin();
  const profile = await getAuthProfile(supabase, user);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[760px] bg-surface px-6 pb-24 pt-5 text-foreground sm:px-8">
      <AdminHeader profile={profile} />

      {children}
      <AdminBottomNav />
    </main>
  );
}
