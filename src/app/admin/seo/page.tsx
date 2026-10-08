import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { siteConfig } from "@/lib/site";
import { SeoTools } from "./tools";
export default async function Page() {
 await requireAdmin();
 return <section className="py-6"><h1 className="text-2xl font-medium">SEO & search</h1><p className="mt-3 text-sm leading-6 text-muted">Use actual search queries and completed work to choose new locality pages. Search Console access is separate from admin Google login.</p><nav className="mt-5 flex flex-wrap gap-3 text-sm"><a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline">Open Search Console ↗</a><a href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(siteConfig.url)}`} target="_blank" rel="noopener noreferrer" className="underline">Open PageSpeed ↗</a><Link href="/sitemap.xml" className="underline">Sitemap</Link><Link href="/admin/areas" className="underline">Locality editor</Link></nav><SeoTools /></section>;
}
