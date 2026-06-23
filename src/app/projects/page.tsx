import type { Metadata } from "next";

import { PublicProjectsPage } from "@/components/public-projects-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { getAllPublicProjects } from "@/lib/public-content";
import { buildProjectsListMetadata } from "@/lib/project-seo";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, projects] = await Promise.all([
    getPublicBusinessSettings(),
    getAllPublicProjects(),
  ]);

  return buildProjectsListMetadata(settings, projects.length);
}

export default function ProjectsPage() {
  return <PublicProjectsPage />;
}