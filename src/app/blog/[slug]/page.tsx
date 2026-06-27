import type { Metadata } from "next";

import { PublicBlogDetailPage } from "@/components/public-blog-detail-page";
import { getPublicBusinessSettings } from "@/lib/business-settings";
import { buildBlogDetailMetadata } from "@/lib/blog-seo";
import {
  getPublicBlogPostBySlug,
  getPublicBlogSlugs,
} from "@/lib/public-content";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPublicBlogSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getPublicBlogPostBySlug(slug),
    getPublicBusinessSettings(),
  ]);

  if (!post) {
    return {
      title: "Article not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildBlogDetailMetadata(post, settings);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  return <PublicBlogDetailPage slug={slug} />;
}