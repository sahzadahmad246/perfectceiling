import type { MetadataRoute } from "next";

import { getAllPublicProjects, getPublicServices } from "@/lib/public-content";
import { getProjectPageUrl } from "@/lib/project-seo";
import { getServicePageUrl } from "@/lib/service-seo";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/services", "/projects"];
  const [services, projects] = await Promise.all([
    getPublicServices(),
    getAllPublicProjects(),
  ]);

  const publishedServices = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  );

  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route === "/services" || route === "/projects" ? 0.9 : 0.8,
  }));

  const serviceEntries = publishedServices.map((service) => ({
    url: getServicePageUrl(service.slug),
    lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const projectEntries = projects.map((project) => ({
    url: getProjectPageUrl(project.slug),
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...serviceEntries, ...projectEntries];
}