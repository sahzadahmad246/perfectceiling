"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminAccountDrawer } from "@/components/admin-account-drawer";
import type { AuthProfile } from "@/lib/auth/profile";

type AdminHeaderProps = {
  profile: AuthProfile;
};

export function AdminHeader({ profile }: AdminHeaderProps) {
  const pathname = usePathname();
  const isSettingsPage = pathname === "/admin/settings";

  return (
    <header className="sticky top-0 z-20 -mx-4 flex items-center justify-between border-b border-border-soft bg-surface/90 px-4 py-2 backdrop-blur-xl sm:-mx-8 sm:px-8">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center">
          {isSettingsPage ? (
            <Link
              aria-label="Back to admin"
              className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
              href="/admin"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                className="inline-flex h-9 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
                href="/"
              >
                PC
              </Link>
              <span className="font-primary text-lg font-medium">Admin</span>
            </div>
          )}
        </div>

        {isSettingsPage ? (
          <h1 className="text-lg font-medium">Settings</h1>
        ) : (
          <span aria-hidden="true" />
        )}

        <div className="flex justify-end">
          <AdminAccountDrawer profile={profile} />
        </div>
      </div>
    </header>
  );
}