"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
  count?: number;
}

export function RatingStars({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showText = false,
  count,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= activeRating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                "transition-transform",
                interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
              )}
            >
              <Star
                className={cn(
                  iconSizes[size],
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-100 text-slate-300"
                )}
              />
            </button>
          );
        })}
      </div>
      {showText && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {rating.toFixed(1)} {count !== undefined && `(${count})`}
        </span>
      )}
    </div>
  );
}
