"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

import { AdminDetailBreadcrumbBar } from "@/components/admin-detail-breadcrumb-bar";
import { getProjectsPageBreadcrumb } from "@/lib/admin-nav";

type ProjectsPageHeaderProps = {
  onAddProject: () => void;
};

export function ProjectsPageHeader({ onAddProject }: ProjectsPageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 bg-surface/90 backdrop-blur-xl sm:-mx-8">
      <header className="border-b border-border-soft px-4 py-2 sm:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center">
            <Link
              aria-label="Back to admin"
              className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
              href="/admin"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
          </div>

          <h1 className="truncate text-center font-primary text-base font-medium">
            Manage projects
          </h1>

          <div className="flex justify-end">
            <button
              aria-label="Add a project"
              className="inline-flex size-9 items-center justify-center rounded-full border border-transparent text-muted transition hover:border-border-soft hover:bg-surface-muted hover:text-foreground"
              onClick={onAddProject}
              title="Add a project"
              type="button"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </header>

      <AdminDetailBreadcrumbBar items={getProjectsPageBreadcrumb()} />
    </div>
  );
}