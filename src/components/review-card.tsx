import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import type { ReviewDTO } from "@/lib/reviews";

/** Formats an ISO date as e.g. "8 Jul 2026". Falls back gracefully. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewCard({ review }: { review: ReviewDTO }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-3">
          <StarRating rating={review.rating} />
          <Badge variant="secondary" className="shrink-0 capitalize">
            {review.source}
          </Badge>
        </div>
        {review.title && (
          <h3 className="text-base font-semibold leading-snug">
            {review.title}
          </h3>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {review.body}
        </p>

        <div className="mt-auto space-y-1 border-t pt-3 text-xs text-[var(--color-muted-foreground)]">
          <p className="font-medium text-[var(--color-foreground)]">
            {review.productName}
          </p>
          <p>
            {review.author ?? "Anonymous"} &middot;{" "}
            {formatDate(review.reviewedAt)}
            {review.country ? ` · ${review.country}` : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
