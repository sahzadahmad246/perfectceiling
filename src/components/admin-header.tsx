"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminAccountDrawer } from "@/components/admin-account-drawer";
import { AdminBreadcrumb } from "@/components/admin-breadcrumb";
import { BrandLogo } from "@/components/brand-logo";
import {
  getAdminGlobalBreadcrumb,
  isAdminDocumentDetailPage,
} from "@/lib/admin-nav";
import type { AuthProfile } from "@/lib/auth/profile";

type AdminHeaderProps = {
  profile: AuthProfile;
  businessName: string;
  logoUrl: string | null;
};

export function AdminHeader({
  profile,
  businessName,
  logoUrl,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const isSettingsPage = pathname === "/admin/settings";
  const isSecondaryAdminPage = pathname.startsWith("/admin/services");

  if (isAdminDocumentDetailPage(pathname) || isSecondaryAdminPage) {
    return null;
  }

  const breadcrumbItems = getAdminGlobalBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-20 -mx-4 flex items-center justify-between border-b border-border-soft bg-surface/90 px-4 py-2 backdrop-blur-xl sm:-mx-8 sm:px-8">
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {isSettingsPage ? (
            <Link
              aria-label="Back to admin"
              className="inline-flex shrink-0 items-center justify-center text-foreground transition hover:text-primary"
              href="/admin"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
          ) : (
            <BrandLogo
              businessName={businessName}
              href="/admin"
              imageClassName="size-9"
              logoUrl={logoUrl}
            />
          )}

          <AdminBreadcrumb
            className="min-w-0 flex-1"
            items={breadcrumbItems}
            size="sm"
          />
        </div>

        <div className="flex shrink-0 justify-end">
          <AdminAccountDrawer profile={profile} />
        </div>
      </div>
    </header>
  );
}