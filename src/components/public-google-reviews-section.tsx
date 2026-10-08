import { ArrowUpRight } from "lucide-react";

import { GoogleReviewsCarousel } from "@/components/google-reviews-carousel";
import { StarRating } from "@/components/star-rating";
import { formatReviewsUpdatedAt, type GoogleBusinessReviews } from "@/lib/google-reviews";

export function PublicGoogleReviewsSection({ data }: { data: GoogleBusinessReviews }) {
  const updated = formatReviewsUpdatedAt(data.fetchedAt);
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="overflow-hidden bg-[#f3eee5] px-4 py-9 sm:px-8">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7c5c39]">Client stories</p>
      <h2 id="reviews-heading" className="mt-2 font-primary text-[26px] font-medium leading-tight tracking-[-0.035em] text-[#292720]">A few words from home.</h2>
      <div className="mt-6 flex items-center gap-4 border-b border-[#cabca6]/65 pb-5">
        <p className="font-primary text-[44px] font-medium leading-none tracking-[-0.045em] text-[#292720]">{data.rating.toFixed(1)}<span className="ml-1 text-xs tracking-normal text-[#6c665c]">/5</span></p>
        <div>
          <StarRating rating={data.rating} size={15} />
          <p className="mt-1.5 text-[11px] text-[#706454]">{data.userRatingCount.toLocaleString("en-IN")} {data.userRatingCount === 1 ? "review" : "reviews"} on Google Maps</p>
        </div>
      </div>
      <GoogleReviewsCarousel reviews={data.reviews} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#cabca6]/65 pt-3">
        <a className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-[#514332] hover:text-[#292720]" href={data.profileUrl} target="_blank" rel="noopener noreferrer">View all Google reviews <ArrowUpRight aria-hidden size={14} /></a>
        {updated ? <p className="text-[9px] text-[#746653]">Updated {updated}</p> : null}
      </div>
    </section>
  );
}
