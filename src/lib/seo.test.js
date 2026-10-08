import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { shouldBypassImageOptimization } from "./image-loading";
import { getLatestContentDate, resolveSeoImageUrls } from "./seo";
import { buildCatalogueDetailMetadata, getCataloguePageUrl } from "./catalogue-seo";
import { JsonLd } from "../components/json-ld";
import { HeroMediaCarousel } from "../components/hero-media-carousel";

test("public storage images use the optimizer; unsupported URLs retain a fallback", () => {
  for (const url of ["/logo.png", "https://project.supabase.co/storage/v1/object/public/photos/a.png", "https://lh3.googleusercontent.com/a"])
    expect(shouldBypassImageOptimization(url)).toBe(false);
  for (const url of ["https://supabase.co.evil.test/a.png", "https://example.com/photo.png", "blob:photo", "data:image/png;base64,a", "http://project.supabase.co/a", "invalid"])
    expect(shouldBypassImageOptimization(url)).toBe(true);
});
test("sitemap dates reflect known edits and omit unknown dates", () => {
  expect(getLatestContentDate([null, "bad"])).toBeUndefined();
  expect(getLatestContentDate(["2026-09-02", "2026-09-04", null]).toISOString()).toBe("2026-09-04T00:00:00.000Z");
});
test("SEO collects every featured image in order without duplicates", () => {
  expect(resolveSeoImageUrls({ featuredUrls: ["/a.png", "/b.png", "/a.png"], galleryUrls: ["/c.png"] })).toEqual(["/a.png", "/b.png", "/c.png"]);
});
test("image sharing keeps its preview and canonicalizes to the collection", () => {
  const settings = { businessName: "Perfect Ceiling", city: "Thane", logoUrl: null };
  const group = { id: "collection", title: "Gypsum", images: [{ id: "photo", imageUrl: "/a.png", subtitle: "Cove ceiling" }] };
  const metadata = buildCatalogueDetailMetadata(group, settings, { imageId: "photo" });
  expect(metadata.alternates.canonical).toBe(getCataloguePageUrl(group.id));
  expect(metadata.openGraph.url).toContain("?image=photo");
});
test("JSON-LD cannot break out of its script tag", () => {
  const html = renderToStaticMarkup(createElement(JsonLd, { data: { name: "</script><script>alert(1)</script>" } }));
  expect(html.match(/<script/g)).toHaveLength(1);
  expect(html).toContain("\\u003c/script>");
});
test("only the first hero image is requested and responsively preloaded in initial HTML", () => {
  const slides = [0, 1, 2, 3, 4].map((index) => ({ id: String(index), mediaType: "image", mediaUrl: `/photo-${index}.png`, overlayTitle: "Ceiling" }));
  const html = renderToStaticMarkup(createElement(HeroMediaCarousel, { slides }));
  expect(html.match(/<img/g)).toHaveLength(1);
  expect(html).toContain('rel="preload"');
  expect(html).toContain('as="image"');
  expect(html).toContain('imageSrcSet=');
  expect(html).not.toContain('loading="lazy"');
});
