import type { MetadataRoute } from "next";

import { getBlogPageUrl } from "@/lib/blog-seo";
import {
  getAllPublicProjects,
  getPublicBlogPosts,
  getPublicServices,
} from "@/lib/public-content";
import { getProjectPageUrl } from "@/lib/project-seo";
import { getHomePageUrl } from "@/lib/home-seo";
import { getServicePageUrl } from "@/lib/service-seo";
import { resolveSeoImageUrls, toAbsoluteUrl } from "@/lib/seo";
import { getServiceGalleryImages } from "@/lib/services";
import { siteConfig } from "@/lib/site";

function sitemapImages(urls: string[]) {
  const absolute = urls.map((url) => toAbsoluteUrl(url));

  return absolute.length > 0 ? absolute : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, blogPosts] = await Promise.all([
    getPublicServices(),
    getAllPublicProjects(),
    getPublicBlogPosts(),
  ]);

  const publishedServices = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  );

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: getHomePageUrl(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      images: sitemapImages(
        resolveSeoImageUrls({
          galleryUrls: publishedServices
            .flatMap((service) =>
              getServiceGalleryImages(service.featuredImageUrl, service.content),
            )
            .map((image) => image.url),
        }),
      ),
    },
    {
      url: `${siteConfig.url}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      images: sitemapImages(
        resolveSeoImageUrls({
          galleryUrls: projects.flatMap((project) =>
            project.galleryImages.map((image) => image.url),
          ),
        }),
      ),
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
      images: sitemapImages(
        resolveSeoImageUrls({
          featuredUrls: blogPosts.map((post) => post.imageUrl),
        }),
      ),
    },
  ];

  const serviceEntries = publishedServices.map((service) => {
    const galleryImages = getServiceGalleryImages(
      service.featuredImageUrl,
      service.content,
    );

    return {
      url: getServicePageUrl(service.slug),
      lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: sitemapImages(
        resolveSeoImageUrls({
          featuredUrls: [service.featuredImageUrl, service.imageUrl],
          galleryUrls: galleryImages.map((image) => image.url),
          content: service.content,
        }),
      ),
    };
  });

  const projectEntries = projects.map((project) => ({
    url: getProjectPageUrl(project.slug),
    lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
    images: sitemapImages(
      resolveSeoImageUrls({
        featuredUrls: [project.imageUrl],
        galleryUrls: project.galleryImages.map((image) => image.url),
        content: project.description,
      }),
    ),
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: getBlogPageUrl(post.slug),
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    images: sitemapImages(
      resolveSeoImageUrls({
        featuredUrls: [post.featuredImageUrl, post.imageUrl],
        content: post.content,
      }),
    ),
  }));

  return [...staticEntries, ...serviceEntries, ...projectEntries, ...blogEntries];
}