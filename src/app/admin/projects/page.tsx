import { FolderKanban } from "lucide-react";
import type { Metadata } from "next";

import { AdminEmptyState } from "@/components/admin-empty-state";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <>
      <section className="py-10">
        <p className="text-sm text-muted">Projects</p>
        <h2 className="mt-3 text-4xl font-medium leading-tight">
          Completed work and gallery items.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          Projects will power the public gallery with service type, location,
          photos, and short descriptions.
        </p>
      </section>

      <AdminEmptyState
        icon={FolderKanban}
        title="No projects yet"
        text="Add completed POP, PVC, wooden, gypsum, and repair work here so the public website can show real proof of work."
      />
    </>
  );
}
