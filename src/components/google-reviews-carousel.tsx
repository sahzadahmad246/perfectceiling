import { GoogleReviewAvatar } from "@/components/google-review-avatar";
import { StarRating } from "@/components/star-rating";
import type { GoogleReview } from "@/lib/google-reviews";

type GoogleReviewsCarouselProps = {
  reviews: GoogleReview[];
};

/** Review list with horizontal separators (kept export name for existing imports). */
export function GoogleReviewsCarousel({ reviews }: GoogleReviewsCarouselProps) {
  if (!reviews.length) {
    return null;
  }

  return (
    <ul className="mt-4 divide-y divide-border-soft">
      {reviews.map((review) => (
        <li className="py-4 first:pt-0 last:pb-0" key={review.id}>
          <div className="flex items-start gap-3">
            <GoogleReviewAvatar
              name={review.authorName}
              photoUrl={review.authorPhotoUrl}
            />
            <div className="min-w-0 flex-1">
              {review.authorUrl ? (
                <a
                  className="block truncate text-sm font-medium text-foreground hover:underline"
                  href={review.authorUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {review.authorName}
                </a>
              ) : (
                <p className="truncate text-sm font-medium text-foreground">
                  {review.authorName}
                </p>
              )}

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <StarRating rating={review.rating} size={12} />
                {review.relativeTime ? (
                  <span className="text-[11px] text-muted">
                    {review.relativeTime}
                  </span>
                ) : null}
              </div>

              {review.text ? (
                <p className="mt-2.5 text-sm leading-6 text-muted">
                  {review.text}
                </p>
              ) : (
                <p className="mt-2.5 text-sm italic text-subtle">
                  Rated {review.rating} stars on Google
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
