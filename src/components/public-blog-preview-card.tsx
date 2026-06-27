import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatBlogPublishedDate, getBlogPublicPath } from "@/lib/blog";
import { getBlogSeoDescription } from "@/lib/blog-seo";
import type { PublicBlogPost } from "@/lib/public-content";

type PublicBlogPreviewCardProps = {
  post: PublicBlogPost;
};

export function PublicBlogPreviewCard({ post }: PublicBlogPreviewCardProps) {
  const href = getBlogPublicPath(post.slug);
  const publishedLabel = formatBlogPublishedDate(post.publishedAt);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition duration-200 hover:border-border-strong">
      <Link className="block" href={href}>
        {post.imageUrl ? (
          <div className="relative aspect-[16/10] bg-surface-muted">
            <Image
              alt={post.title}
              className="object-cover"
              fill
              sizes="560px"
              src={post.imageUrl}
              unoptimized={post.imageUrl.startsWith("http")}
            />
          </div>
        ) : null}

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            {post.category ? (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium">
                {post.category}
              </span>
            ) : null}
            {publishedLabel ? <span>{publishedLabel}</span> : null}
          </div>

          <h3 className="mt-3 font-primary text-xl font-semibold leading-snug text-foreground">
            {post.title}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
            {getBlogSeoDescription(post)}
          </p>

          <span className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 group-hover:bg-primary-hover">
            Read article
            <ArrowUpRight size={15} />
          </span>
        </div>
      </Link>
    </article>
  );
}