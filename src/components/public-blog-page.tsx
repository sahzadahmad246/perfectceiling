import { JsonLd } from "@/components/json-ld";
import { ArticlesBrowser } from "@/components/public-content-browser";
import { PublicInquiry, PublicPageHeading, PublicPageLayout } from "@/components/public-page-layout";
import { ShareButton } from "@/components/share-button";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { buildBlogListJsonLd, getBlogListUrl } from "@/lib/blog-seo";
import { getPublicBlogPosts } from "@/lib/public-content";

export async function PublicBlogPage() {
  const [settings, posts] = await Promise.all([getPublicBusinessSettings(), getPublicBlogPosts()]);
  const whatsappHref = toWhatsAppLink(settings.whatsapp, "Hi, I read your design journal and would like advice for my space.");
  return <PublicPageLayout settings={settings} whatsappHref={whatsappHref}>
    <JsonLd data={buildBlogListJsonLd(posts, settings)} />
    <PublicPageHeading eyebrow="The design journal" title="Ideas for better spaces." share={<ShareButton variant="icon" label="Share articles" title={`Design journal — ${settings.businessName}`} text="Ceiling ideas, materials and practical guides." url={getBlogListUrl()} className="border-[#d8d0c3] bg-transparent" />}>
      <p className="mt-4 max-w-[36ch] text-sm leading-6 text-[#746e63]">Design inspiration and practical advice, from choosing a finish to caring for it.</p>
    </PublicPageHeading>
    <ArticlesBrowser posts={posts} />
    <PublicInquiry settings={settings} whatsappHref={whatsappHref} title="Turn an idea into your home." />
  </PublicPageLayout>;
}
