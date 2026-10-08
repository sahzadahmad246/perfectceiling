"use server";
import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { siteConfig } from "@/lib/site";
const pageSpeed = unstable_cache(async (_configuration: string) => {
  void _configuration;
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return { error: "Add server-only PAGESPEED_API_KEY from your own Google Cloud project, with PageSpeed Insights API enabled. The shared unauthenticated quota returned HTTP 429." };
  const url = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  url.searchParams.set("url", siteConfig.url); url.searchParams.set("key", key); url.searchParams.set("strategy", "mobile");
  for (const category of ["performance", "seo", "accessibility", "best-practices"]) url.searchParams.append("category", category);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(55000) });
    if (!response.ok) return { error: response.status === 429 ? "Google quota exceeded. Check this API project's quota/billing and retry later; this is not a website error." : `Google PageSpeed returned HTTP ${response.status}. Check API activation and key restrictions.` };
    const result = await response.json();
    const lighthouse = result.lighthouseResult;
    if (!lighthouse?.categories) return { error: "Google did not return a completed Lighthouse audit." };
    return { checkedAt: new Date().toISOString(), scores: Object.values(lighthouse.categories).map((c) => { const item = c as { title: string; score: number | null }; return { title: item.title, score: item.score === null ? null : Math.round(item.score * 100) }; }), metrics: ["largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time"].map(id => ({ title: lighthouse.audits[id]?.title, value: lighthouse.audits[id]?.displayValue })) };
  } catch { return { error: "PageSpeed did not complete within 55 seconds. Try the PageSpeed website or retry later." }; }
}, ["admin-mobile-pagespeed-v1"], { revalidate: 86400 });
export async function checkPageSpeed() {
  await requireAdmin();
  if (!process.env.PAGESPEED_API_KEY) return { error: "Add server-only PAGESPEED_API_KEY from your own Google Cloud project with PageSpeed Insights API enabled." };
  return pageSpeed(createHash("sha256").update(process.env.PAGESPEED_API_KEY).digest("hex"));
}
export async function loadSearchConsole() {
 await requireAdmin();
 const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID;
 const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET;
 const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;
 if (!clientId || !clientSecret || !refreshToken) return { error: "Search Console needs a Google OAuth client and a refresh token with webmasters.readonly access. See docs/seo-setup.md. Your normal Google login does not grant Search Console access." };
 try {
 const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }), signal: AbortSignal.timeout(15000), cache: "no-store" });
 if (!tokenResponse.ok) return { error: "Google authorization failed. Check OAuth credentials and refresh token." };
 const token = await tokenResponse.json();
 const property = process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY || siteConfig.url + "/";
 const end = new Date(); end.setUTCDate(end.getUTCDate() - 3); const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27);
 const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`, { method: "POST", headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), dimensions: ["query"], rowLimit: 20 }), signal: AbortSignal.timeout(15000), cache: "no-store" });
 if (!response.ok) return { error: `Search Console returned HTTP ${response.status}. Enable its API and verify the authorized account has access to the exact property.` };
 const data = await response.json();
 return { property, startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), rows: (data.rows || []) as { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };
 } catch { return { error: "Could not reach Google Search Console. Please retry later." }; }
}
