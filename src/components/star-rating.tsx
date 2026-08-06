import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  size?: number;
  className?: string;
};

export function StarRating({
  rating,
  size = 16,
  className,
}: StarRatingProps) {
  const value = Math.max(0, Math.min(5, rating));

  return (
    <div
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, value - index));

        return (
          <span className="relative inline-flex" key={index}>
            <Star
              aria-hidden
              className="text-amber-200"
              fill="currentColor"
              size={size}
              strokeWidth={0}
            />
            {fill > 0 ? (
              <span
                aria-hidden
                className="absolute inset-0 overflow-hidden text-amber-500"
                style={{ width: `${fill * 100}%` }}
              >
                <Star fill="currentColor" size={size} strokeWidth={0} />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
