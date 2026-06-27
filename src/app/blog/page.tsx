import type { Metadata } from "next";

import { PublicBlogPage } from "@/components/public-blog-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { buildBlogListMetadata } from "@/lib/blog-seo";
import { getPublicBlogPosts } from "@/lib/public-content";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, posts] = await Promise.all([
    getPublicBusinessSettings(),
    getPublicBlogPosts(),
  ]);

  return buildBlogListMetadata(settings, posts);
}

export default function BlogPage() {
  return <PublicBlogPage />;
}