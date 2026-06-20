import type { MetadataRoute } from "next";

import { getPublicServices } from "@/lib/public-content";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/services", "/projects", "/blog", "/contact"];
  const services = await getPublicServices();
  const publishedServices = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  );

  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route === "/services" ? 0.9 : 0.8,
  }));

  const serviceEntries = publishedServices.map((service) => ({
    url: `${siteConfig.url}/services/${service.slug}`,
    lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...serviceEntries];
}