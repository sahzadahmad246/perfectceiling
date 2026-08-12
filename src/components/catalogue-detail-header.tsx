"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminDetailBreadcrumbBar } from "@/components/admin-detail-breadcrumb-bar";
import { ShareButton } from "@/components/share-button";
import { getCatalogueDetailBreadcrumb } from "@/lib/admin-nav";

type CatalogueDetailHeaderProps = {
  caption: string;
  /** Public page URL for this design (shared with customers). */
  publicUrl?: string;
};

export function CatalogueDetailHeader({
  caption,
  publicUrl,
}: CatalogueDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 bg-surface/90 backdrop-blur-xl sm:-mx-8">
      <header className="border-b border-border-soft px-4 py-2 sm:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center">
            <Link
              aria-label="Back to catalogue"
              className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
              href="/admin/catalogue"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
          </div>

          <h1 className="truncate text-center font-primary text-base font-medium">
            {caption || "Catalogue group"}
          </h1>

          <div className="flex justify-end">
            {publicUrl ? (
              <ShareButton
                label="Share public page"
                text={caption || "Ceiling design from Perfect Ceiling"}
                title={caption || "Catalogue design"}
                url={publicUrl}
                variant="icon"
              />
            ) : null}
          </div>
        </div>
      </header>

      <AdminDetailBreadcrumbBar
        items={getCatalogueDetailBreadcrumb(caption || "Group")}
      />
    </div>
  );
}
