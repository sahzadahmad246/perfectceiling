import { redirect } from "next/navigation";

import { getAdminEmails, hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=supabase-env");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const adminEmails = getAdminEmails();
  const isAdmin = adminEmails.includes(user.email.toLowerCase());

  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect("/login?error=not-admin");
  }

  return { supabase, user };
}
