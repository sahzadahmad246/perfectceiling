import { describe, expect, test } from "bun:test";

import { GOOGLE_REVIEWS_REVALIDATE_SECONDS, readCachedGoogleReviews } from "./google-reviews-cache";

const snapshot = { placeName: "Perfect Ceiling", rating: 4.8, userRatingCount: 21, profileUrl: "https://maps.google.com/", googleMapsUri: null, reviews: [], fetchedAt: "2026-10-01T00:00:00Z" };

function store(acquired, payload) {
  const saved = [];
  const cache = { claim: async () => ({ acquired, payload }), complete: async (value) => { saved.push(value); } };
  return { cache, saved };
}

describe("persistent Google reviews cache", () => {
  test("uses a three-day interval", () => expect(GOOGLE_REVIEWS_REVALIDATE_SECONDS).toBe(259200));
  test("fresh or already-claimed cache never calls Google", async () => {
    const { cache, saved } = store(false, snapshot);
    let calls = 0;
    expect(await readCachedGoogleReviews(cache, async () => { calls++; return null; })).toBe(snapshot);
    expect(calls).toBe(0); expect(saved).toHaveLength(0);
  });
  test("a concurrent initial visitor does not duplicate the refresh", async () => {
    const { cache } = store(false, null);
    expect(await readCachedGoogleReviews(cache, async () => { throw new Error("Must not fetch"); })).toBeNull();
  });
  test("refresh saves the latest snapshot", async () => {
    const { cache, saved } = store(true, snapshot);
    const updated = { ...snapshot, rating: 4.9 };
    expect(await readCachedGoogleReviews(cache, async () => updated)).toBe(updated);
    expect(saved).toEqual([updated]);
  });
  test("API failure preserves the previous reviews and records a retry", async () => {
    const { cache, saved } = store(true, snapshot);
    expect(await readCachedGoogleReviews(cache, async () => null)).toBe(snapshot);
    expect(saved).toEqual([null]);
  });
  test("thrown refresh failure releases the lease through completion", async () => {
    const { cache, saved } = store(true, snapshot);
    expect(await readCachedGoogleReviews(cache, async () => { throw new Error("Google unavailable"); })).toBe(snapshot);
    expect(saved).toEqual([null]);
  });
});
