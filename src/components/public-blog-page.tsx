import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { PublicBlogPreviewCard } from "@/components/public-blog-preview-card";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import { buildBlogListJsonLd } from "@/lib/blog-seo";
import { getPublicBlogPosts } from "@/lib/public-content";

export async function PublicBlogPage() {
  const [settings, posts] = await Promise.all([
    getPublicBusinessSettings(),
    getPublicBlogPosts(),
  ]);

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    "Hi Perfect Ceiling, I read your blog and have a question about ceiling work.",
  );
  const telHref = toTelLink(settings.phone);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildBlogListJsonLd(posts, settings)} />

      <SiteHeader />

      <nav aria-label="Breadcrumb" className="mt-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="minimal-link" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">Blog</li>
        </ol>
      </nav>

      <section className="mt-6">
        <p className="text-sm text-muted">Blog</p>
        <h1 className="mt-2 font-primary text-3xl font-medium">
          Ceiling tips and guides in {settings.city}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Practical articles on false ceiling cost, materials, maintenance, and
          design ideas from {settings.businessName}.
        </p>
      </section>

      {posts.length > 0 ? (
        <section aria-label="Blog articles" className="mt-8 space-y-4">
          {posts.map((post) => (
            <PublicBlogPreviewCard key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-border-soft bg-surface-muted/70 p-5 text-center">
          <p className="text-sm font-medium text-foreground">Articles coming soon</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Published blog posts from admin will appear here automatically.
          </p>
        </section>
      )}

      <section className="mt-10 rounded-2xl bg-surface-muted/80 px-4 py-5">
        <p className="text-sm text-muted">Need help with your ceiling?</p>
        <h2 className="mt-2 text-2xl font-medium">
          Ask us for a measured quotation.
        </h2>
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
    </main>
  );
}