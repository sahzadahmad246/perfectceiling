import { ArrowUpRight, Clock3 } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PublicBlogPreviewCard } from "@/components/public-blog-preview-card";
import { PublicInquiry, PublicPageHeading, PublicPageLayout } from "@/components/public-page-layout";
import { RecordContentView } from "@/components/record-content-view";
import { ShareButton } from "@/components/share-button";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { formatBlogPublishedDate, prepareBlogPageContent } from "@/lib/blog";
import { buildBlogDetailJsonLd, getBlogPageUrl, getBlogSeoDescription } from "@/lib/blog-seo";
import { getPublicBlogPostBySlug, getPublicBlogPosts } from "@/lib/public-content";

export async function PublicBlogDetailPage({ slug }: { slug: string }) {
  const [post, settings, posts] = await Promise.all([getPublicBlogPostBySlug(slug), getPublicBusinessSettings(), getPublicBlogPosts()]);
  if (!post) notFound();
  const whatsappHref = toWhatsAppLink(settings.whatsapp, `Hi, I read your article "${post.title}" and have a question about my space.`);
  const contentHtml = prepareBlogPageContent(post.content, { title: post.title, excerpt: post.excerpt, seoTitle: post.seoTitle, seoDescription: post.seoDescription });
  const text = contentHtml.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").trim();
  const readingMinutes = Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  const publishedLabel = formatBlogPublishedDate(post.publishedAt);
  const related = posts.filter((item) => item.id !== post.id).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 2);
  const cover = post.featuredImageUrl || post.imageUrl;
  return <PublicPageLayout settings={settings} whatsappHref={whatsappHref}>
    <JsonLd data={buildBlogDetailJsonLd(post, settings)} />
    <RecordContentView id={post.id} kind="blog" />
    <article itemScope itemType="https://schema.org/BlogPosting">
      <meta content={post.title} itemProp="headline" /><meta content={getBlogSeoDescription(post)} itemProp="description" /><meta content={getBlogPageUrl(post.slug)} itemProp="url" />{post.publishedAt ? <meta content={post.publishedAt} itemProp="datePublished" /> : null}
      <PublicPageHeading href="/blog" backLabel="The design journal" eyebrow={post.category || "Ideas & advice"} title={post.title} share={<ShareButton variant="icon" label="Share article" title={`${post.title} — ${settings.businessName}`} text={getBlogSeoDescription(post)} url={getBlogPageUrl(post.slug)} className="border-[#d8d0c3] bg-transparent" />}>
        {post.excerpt ? <p className="mt-4 text-sm leading-7 text-[#746e63]">{post.excerpt}</p> : null}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#827563]"><span className="font-medium text-[#4d493f]">{settings.businessName}</span>{publishedLabel ? <span>{publishedLabel}</span> : null}{text ? <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden size={12} />{readingMinutes} min read</span> : null}</div>
      </PublicPageHeading>
      {cover ? <figure className="relative mt-6 aspect-[16/10] overflow-hidden rounded-lg bg-[#e8e2d8]"><Image alt={post.title} className="object-cover" fill itemProp="image" loading="eager" fetchPriority="high" sizes="(max-width: 560px) calc(100vw - 32px), 496px" src={cover} unoptimized={shouldBypassImageOptimization(cover)} /></figure> : null}
      {contentHtml.trim() ? <div className="article-editor-preview public-reading-content mt-8" dangerouslySetInnerHTML={{ __html: contentHtml }} itemProp="articleBody" /> : null}
      <div className="mt-8 flex items-center justify-between gap-3 border-y border-[#e1dbcf] py-4"><p className="text-xs text-[#827563]">An idea worth sharing?</p><ShareButton label="Share story" title={post.title} text={getBlogSeoDescription(post)} url={getBlogPageUrl(post.slug)} className="border-[#d8d0c3] bg-transparent text-xs" /></div>
    </article>
    {related.length ? <section className="mt-10"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-primary text-xl font-medium tracking-tight">Keep reading</h2><Link href="/blog" className="inline-flex min-h-10 items-center gap-1 text-[11px] text-[#91704a]">All articles<ArrowUpRight aria-hidden size={14} /></Link></div>{related.map((item) => <PublicBlogPreviewCard key={item.id} post={item} />)}</section> : null}
    <PublicInquiry settings={settings} whatsappHref={whatsappHref} title="Bring the idea home." />
  </PublicPageLayout>;
}
