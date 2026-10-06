import type { HeroSlide } from "@/lib/public-content";

/** Five distinct photos, alternating sources and featuring different records first. */
export function selectHeroSlides(sources: HeroSlide[][]): HeroSlide[] {
  const selected: HeroSlide[] = [];
  const seenImages = new Set<string>();
  const seenRecords = new Set<string>();
  const candidates: HeroSlide[] = [];
  const count = Math.max(0, ...sources.map((source) => source.length));
  for (let index = 0; index < count; index++) {
    for (const source of sources) {
      if (source[index]) candidates.push(source[index]);
    }
  }

  // Prefer different projects/catalogue groups; then fill from their galleries.
  for (const preferNewRecord of [true, false]) {
    for (const slide of candidates) {
      const url = slide.mediaUrl.trim();
      const record = slide.href || slide.id;
      if (slide.mediaType !== "image" || !url || seenImages.has(url)) continue;
      if (preferNewRecord && seenRecords.has(record)) continue;
      selected.push({ ...slide, mediaUrl: url });
      seenImages.add(url);
      seenRecords.add(record);
      if (selected.length === 5) return selected;
    }
  }
  return selected;
}
