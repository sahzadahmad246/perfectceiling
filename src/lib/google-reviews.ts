import { randomUUID } from "node:crypto";
import { cache } from "react";
import { unstable_cache } from "next/cache";

import { GOOGLE_REVIEWS_REVALIDATE_SECONDS, readCachedGoogleReviews } from "@/lib/google-reviews-cache";
import { createServiceClient } from "@/lib/supabase/admin";

export { GOOGLE_REVIEWS_REVALIDATE_SECONDS } from "@/lib/google-reviews-cache";

export type GoogleReview = {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  authorUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string | null;
  publishTime: string | null;
};

export type GoogleBusinessReviews = {
  placeName: string;
  rating: number;
  userRatingCount: number;
  /** Preferred public profile / Maps link for "See all". */
  profileUrl: string;
  googleMapsUri: string | null;
  reviews: GoogleReview[];
  /** ISO timestamp when this payload was fetched from Google. */
  fetchedAt: string;
};

type LegacyReview = {
  author_name?: string;
  author_url?: string;
  profile_photo_url?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
  time?: number;
};

type LegacyPlaceDetailsResponse = {
  status?: string;
  error_message?: string;
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: LegacyReview[];
  };
};

function getGooglePlacesConfig() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const placeId = process.env.GOOGLE_PLACE_ID?.trim() ?? "";

  if (!apiKey || !placeId) {
    return null;
  }

  const businessUrl = process.env.GOOGLE_BUSINESS_URL?.trim() || null;

  return { apiKey, placeId, businessUrl };
}

export function hasGoogleReviewsEnv() {
  return Boolean(getGooglePlacesConfig());
}

function resolveProfileUrl(
  googleMapsUri: string | null,
  businessUrl: string | null,
) {
  if (businessUrl) {
    return businessUrl;
  }

  if (googleMapsUri) {
    return googleMapsUri;
  }

  return "https://www.google.com/search?q=perfect+ceiling+pop+contractor+thane+reviews";
}

function mapLegacyReview(review: LegacyReview, index: number): GoogleReview | null {
  const rating = Number(review.rating);
  const authorName = review.author_name?.trim() || "Google user";

  if (!Number.isFinite(rating) || rating <= 0) {
    return null;
  }

  return {
    id: `review-${review.time ?? index}-${authorName}`,
    authorName,
    authorPhotoUrl: review.profile_photo_url?.trim() || null,
    authorUrl: review.author_url?.trim() || null,
    rating,
    text: review.text?.trim() || "",
    relativeTime: review.relative_time_description?.trim() || null,
    publishTime:
      typeof review.time === "number"
        ? new Date(review.time * 1000).toISOString()
        : null,
  };
}

/**
 * Place Details (legacy Places API) — works with standard Maps API keys.
 * Returns rating, total count, and up to 5 sample reviews.
 */
async function fetchGoogleBusinessReviewsFromApi(config = getGooglePlacesConfig()): Promise<GoogleBusinessReviews | null> {

  if (!config) {
    return null;
  }

  const placeId = config.placeId.replace(/^places\//, "");
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "name,rating,user_ratings_total,reviews,url",
  );
  url.searchParams.set("reviews_sort", "newest");
  url.searchParams.set("key", config.apiKey);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    console.error(
      "[google-reviews] HTTP error",
      response.status,
      await response.text().catch(() => ""),
    );
    return null;
  }

  const data = (await response.json()) as LegacyPlaceDetailsResponse;

  if (data.status !== "OK" || !data.result) {
    console.error(
      "[google-reviews] Places status",
      data.status,
      data.error_message ?? "",
    );
    return null;
  }

  const rating = Number(data.result.rating);
  const userRatingCount = Number(data.result.user_ratings_total);

  if (!Number.isFinite(rating) || rating <= 0) {
    return null;
  }

  const googleMapsUri = data.result.url?.trim() || null;
  const reviews = (data.result.reviews ?? [])
    .map((review, index) => mapLegacyReview(review, index))
    .filter((review): review is GoogleReview => Boolean(review))
    .slice(0, 5);

  return {
    placeName: data.result.name?.trim() || "Perfect Ceiling",
    rating,
    userRatingCount: Number.isFinite(userRatingCount) ? userRatingCount : 0,
    profileUrl: resolveProfileUrl(googleMapsUri, config.businessUrl),
    googleMapsUri,
    reviews,
    fetchedAt: new Date().toISOString(),
  };
}

// Compatibility fallback until the persistent-cache SQL migration is applied.
// The Place ID and profile URL are arguments, so configuration changes use a new key.
const getFrameworkCachedReviews = unstable_cache(
  async (placeId: string, businessUrl: string | null) => {
    const config = getGooglePlacesConfig();
    return config ? fetchGoogleBusinessReviewsFromApi({ ...config, placeId, businessUrl }) : null;
  },
  ["google-business-reviews-72h-v2"],
  { revalidate: GOOGLE_REVIEWS_REVALIDATE_SECONDS, tags: ["google-reviews"] },
);

let reportedMissingCache = false;

export const getGoogleBusinessReviews = cache(async (): Promise<GoogleBusinessReviews | null> => {
  const config = getGooglePlacesConfig();
  if (!config) return null;
  const placeId = config.placeId.replace(/^places\//, "");
  const client = createServiceClient();
  if (client) {
    const token = randomUUID();
    const { data, error } = await client.rpc("claim_google_reviews_refresh", { p_place_id: placeId, p_token: token });
    if (!error && data?.[0]) {
      const snapshot = data[0] as { acquired: boolean; payload: GoogleBusinessReviews | null };
      try {
        const result = await readCachedGoogleReviews({
          claim: async () => snapshot,
          complete: async (payload) => {
            const { error: saveError } = await client.rpc("complete_google_reviews_refresh", { p_place_id: placeId, p_token: token, p_payload: payload });
            if (saveError) throw new Error(saveError.message);
          },
        }, fetchGoogleBusinessReviewsFromApi);
        return result ? { ...result, profileUrl: resolveProfileUrl(result.googleMapsUri, config.businessUrl) } : null;
      } catch (cacheError) {
        console.error("[google-reviews] persistent cache failed", cacheError instanceof Error ? cacheError.message : "Unknown error");
        // Do not make a second Google request when saving the refresh failed.
        return snapshot.payload;
      }
    }
    if (!reportedMissingCache) {
      reportedMissingCache = true;
      console.warn("[google-reviews] persistent cache unavailable; apply the Google reviews cache migration.");
    }
  }
  try {
    return await getFrameworkCachedReviews(placeId, config.businessUrl);
  } catch (error) {
    console.error("[google-reviews] fetch failed", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
});

export function formatReviewsUpdatedAt(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
