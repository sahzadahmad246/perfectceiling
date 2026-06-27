import { MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import {
  formatBlogPublishedDate,
  prepareBlogPageContent,
} from "@/lib/blog";
import {
  buildBlogDetailJsonLd,
  getBlogPageUrl,
  getBlogSeoDescription,
} from "@/lib/blog-seo";
import { getPublicBlogPostBySlug } from "@/lib/public-content";

type PublicBlogDetailPageProps = {
  slug: string;
};

export async function PublicBlogDetailPage({ slug }: PublicBlogDetailPageProps) {
  const [post, settings] = await Promise.all([
    getPublicBlogPostBySlug(slug),
    getPublicBusinessSettings(),
  ]);

  if (!post) {
    notFound();
  }

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    `Hi Perfect Ceiling, I read your article "${post.title}" and have a question.`,
  );
  const telHref = toTelLink(settings.phone);
  const contentHtml = prepareBlogPageContent(post.content, {
    title: post.title,
    excerpt: post.excerpt,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
  });
  const hasContent = Boolean(contentHtml.trim());
  const publishedLabel = formatBlogPublishedDate(post.publishedAt);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildBlogDetailJsonLd(post, settings)} />

      <SiteHeader />

      <nav aria-label="Breadcrumb" className="mt-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="minimal-link" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link className="minimal-link" href="/blog">
              Blog
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="line-clamp-1 text-foreground">{post.title}</li>
        </ol>
      </nav>

      <article itemScope itemType="https://schema.org/BlogPosting">
        <meta content={post.title} itemProp="headline" />
        <meta content={getBlogSeoDescription(post)} itemProp="description" />
        <meta content={getBlogPageUrl(post.slug)} itemProp="url" />
        {post.publishedAt ? (
          <meta content={post.publishedAt} itemProp="datePublished" />
        ) : null}

        <header className="mt-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {post.category ? (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium">
                {post.category}
              </span>
            ) : null}
            {publishedLabel ? <span>{publishedLabel}</span> : null}
          </div>
          <h1 className="mt-3 font-primary text-3xl font-medium">{post.title}</h1>
          {post.excerpt ? (
            <p className="mt-4 text-sm leading-7 text-foreground">{post.excerpt}</p>
          ) : null}
        </header>

        {post.imageUrl ? (
          <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl bg-surface-muted">
            <Image
              alt={post.title}
              className="object-cover"
              fill
              itemProp="image"
              priority
              sizes="560px"
              src={post.imageUrl}
              unoptimized={post.imageUrl.startsWith("http")}
            />
          </div>
        ) : null}

        {hasContent ? (
          <section className="mt-8 border-t border-border-soft pt-8">
            <div
              className="article-editor-preview text-sm leading-7 text-foreground"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
              itemProp="articleBody"
            />
          </section>
        ) : null}
      </article>

      <section className="mt-10 rounded-2xl bg-surface-muted/80 px-4 py-5">
        <p className="text-sm text-muted">Need a quote?</p>
        <h2 className="mt-2 text-2xl font-medium">Talk to us about your ceiling work.</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Share room photos and measurements on WhatsApp. We will send a measured
          quotation for work in {settings.city}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary-hover"
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium text-foreground transition duration-200 hover:border-primary"
            href={telHref}
          >
            <Phone size={17} />
            Call now
          </a>
        </div>
      </section>

      <footer className="mt-8 border-t border-border-soft pt-5 text-sm text-muted">
        <Link className="minimal-link" href="/blog">
          Back to all articles
        </Link>
      </footer>
    </main>
  );
}