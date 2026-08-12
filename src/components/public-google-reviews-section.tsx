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
  const reviewCountLabel = `${formatRatingCount(data.userRatingCount)} review${
    data.userRatingCount === 1 ? "" : "s"
  }`;

  return (
    <section
      className="landing-section landing-bg-reviews px-4 sm:px-8"
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

        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(24,24,27,0.08)] backdrop-blur-sm">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <StarRating rating={data.rating} size={18} />
              <p className="font-primary text-3xl font-semibold leading-none tracking-tight text-foreground">
                {ratingLabel}
              </p>
              <p className="text-sm text-muted">{reviewCountLabel}</p>
            </div>

            <div className="mt-4 border-t border-border-soft" />

            <GoogleReviewsCarousel reviews={data.reviews} />
          </div>

          <div className="border-t border-border-soft px-5 py-3 sm:px-6">
            <a
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4285F4] transition hover:text-[#3367d6]"
              href={profileHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              See all on Google
              <ArrowUpRight size={14} />
            </a>
            {updatedLabel ? (
              <p className="mt-1 text-[11px] leading-5 text-muted">
                Last updated: {updatedLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
