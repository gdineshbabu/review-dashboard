import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Renders a 1..5 star rating. Purely presentational. */
export function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
      title={`${rating} / 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-[var(--color-muted-foreground)]",
          )}
        />
      ))}
    </div>
  );
}
