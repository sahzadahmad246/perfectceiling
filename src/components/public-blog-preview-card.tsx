import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import Link from "next/link";

import { formatBlogPublishedDate, getBlogPublicPath } from "@/lib/blog";
import { getBlogSeoDescription } from "@/lib/blog-seo";
import type { PublicBlogPost } from "@/lib/public-content";

export function PublicBlogPreviewCard({ post, featured = false, lcpImage = false }: { post: PublicBlogPost; featured?: boolean; lcpImage?: boolean }) {
  const date = formatBlogPublishedDate(post.publishedAt);
  return <article className={featured ? "pb-7" : "border-t border-[#e1dbcf] py-6"}>
    <Link href={getBlogPublicPath(post.slug)} className={`group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a] ${featured ? "" : "flex items-start gap-4"}`}>
      {post.imageUrl ? <div className={`relative shrink-0 overflow-hidden rounded-lg bg-[#e8e2d8] ${featured ? "mb-5 aspect-[16/10] w-full" : "order-2 mt-1 aspect-square w-[88px] sm:w-[112px]"}`}><Image alt={post.title} fill loading={lcpImage ? "eager" : "lazy"} fetchPriority={lcpImage ? "high" : "auto"} src={post.imageUrl} sizes={featured ? "(max-width: 560px) calc(100vw - 32px), 496px" : "112px"} className="object-cover transition duration-500 group-hover:scale-[1.035] motion-reduce:transform-none" unoptimized={shouldBypassImageOptimization(post.imageUrl)} /></div> : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#746653]"><span className="font-medium uppercase tracking-[0.1em] text-[#80603e]">{post.category || "Design journal"}</span>{date ? <span>{date}</span> : null}</div>
        <h2 className={`mt-2 font-primary font-medium leading-snug tracking-[-0.025em] transition group-hover:text-[#80603e] ${featured ? "text-[26px]" : "text-[18px]"}`}>{post.title}</h2>
        <p className={`mt-2 text-xs leading-6 text-[#6c665c] ${featured ? "line-clamp-3" : "line-clamp-2"}`}>{getBlogSeoDescription(post)}</p>
        <span className="mt-3 inline-flex min-h-8 items-center gap-2 text-[11px] font-medium text-[#80603e]">Read the story<ArrowUpRight aria-hidden size={14} /></span>
      </div>
    </Link>
  </article>;
}
