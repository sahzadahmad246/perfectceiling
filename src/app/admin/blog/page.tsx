import type { Metadata } from "next";
import { Suspense } from "react";

import { listBlogPosts } from "@/app/admin/blog/actions";
import { BlogPageClient } from "@/components/blog-page-client";
import { PageSpinner } from "@/components/page-spinner";

export const metadata: Metadata = {
  title: "Blogs",
};

export default async function BlogPage() {
  const posts = await listBlogPosts();

  return (
    <Suspense fallback={<PageSpinner label="Loading blog..." />}>
      <BlogPageClient posts={posts} />
    </Suspense>
  );
}