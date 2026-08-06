import { ArrowUpRight } from "lucide-react";

import { GoogleReviewsCarousel } from "@/components/google-reviews-carousel";
import { StarRating } from "@/components/star-rating";
import {
  formatReviewsUpdatedAt,
  type GoogleBusinessReviews,
} from "@/lib/google-reviews";

type PublicGoogleReviewsSectionProps = {
  data: GoogleBusinessReviews;
};

function formatRatingCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }

  return String(count);
}

export function PublicGoogleReviewsSection({
  data,
}: PublicGoogleReviewsSectionProps) {
  const ratingLabel = data.rating.toFixed(1);
  const profileHref = data.profileUrl;
  const updatedLabel = formatReviewsUpdatedAt(data.fetchedAt);

  return (
    <section
      className="landing-section landing-bg-shade-cool px-4 sm:px-8"
      id="reviews"
    >
      <div aria-hidden className="landing-section-bg" />
      <div className="landing-section-content">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Google reviews</p>
            <h2 className="mt-2 text-2xl font-medium">Trusted by clients</h2>
          </div>
          <a
            className="minimal-link inline-flex items-center gap-1 text-sm"
            href={profileHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            See all
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Rating hero */}
        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-border-soft bg-surface-raised shadow-[0_16px_48px_rgba(24,24,27,0.07)]">
          <div className="relative bg-[radial-gradient(120%_90%_at_0%_0%,rgba(251,191,36,0.18),transparent_55%),linear-gradient(160deg,#fffdf8_0%,#ffffff_48%,#f8fafc_100%)] px-5 py-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex size-[5.5rem] shrink-0 flex-col items-center justify-center rounded-[1.35rem] border border-amber-100/80 bg-white shadow-[0_8px_24px_rgba(245,158,11,0.12)]">
                <p className="font-primary text-[2.5rem] font-semibold leading-none tracking-tight text-foreground">
                  {ratingLabel}
                </p>
                <StarRating className="mt-2" rating={data.rating} size={13} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-white/90 px-2.5 py-1 text-[11px] font-medium text-muted shadow-sm">
                  <span
                    aria-hidden
                    className="inline-flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold leading-none text-[#4285F4] shadow-sm ring-1 ring-border-soft"
                  >
                    G
                  </span>
                  Google
                </div>

                <p className="mt-2.5 font-primary text-lg font-medium leading-snug text-foreground">
                  {formatRatingCount(data.userRatingCount)} review
                  {data.userRatingCount === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {data.placeName}
                </p>
              </div>
            </div>

            <a
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#4285F4] px-5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(66,133,244,0.28)] transition hover:bg-[#3367d6]"
              href={profileHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              See all on Google
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        {/* Side-by-side review carousel */}
        <GoogleReviewsCarousel reviews={data.reviews} />

        {updatedLabel ? (
          <p className="mt-4 text-[11px] leading-5 text-muted">
            Last updated: {updatedLabel}
          </p>
        ) : null}
      </div>
    </section>
  );
}
