import type { GoogleBusinessReviews } from "@/lib/google-reviews";

export const GOOGLE_REVIEWS_REVALIDATE_SECONDS = 60 * 60 * 24 * 3;

export type ReviewsCacheStore = {
  claim: () => Promise<{ acquired: boolean; payload: GoogleBusinessReviews | null }>;
  complete: (payload: GoogleBusinessReviews | null) => Promise<void>;
};

/** Reuse the last snapshot while another instance refreshes or Google is unavailable. */
export async function readCachedGoogleReviews(store: ReviewsCacheStore, fetchReviews: () => Promise<GoogleBusinessReviews | null>) {
  const snapshot = await store.claim();
  if (!snapshot.acquired) return snapshot.payload;

  let fresh: GoogleBusinessReviews | null = null;
  try {
    fresh = await fetchReviews();
  } catch (error) {
    console.error("[google-reviews] refresh failed", error instanceof Error ? error.message : "Unknown error");
  }
  await store.complete(fresh);
  return fresh || snapshot.payload;
}
