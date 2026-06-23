import type { Metadata } from "next";
import { Suspense } from "react";

import { listProjects } from "@/app/admin/projects/actions";
import { PageSpinner } from "@/components/page-spinner";
import { ProjectsPageClient } from "@/components/projects-page-client";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <Suspense fallback={<PageSpinner label="Loading projects..." />}>
      <ProjectsPageClient projects={projects} />
    </Suspense>
  );
}