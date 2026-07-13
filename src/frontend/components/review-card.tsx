import { Card, CardContent, CardHeader } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { StarRating } from "@/frontend/components/star-rating";
import { formatDate } from "@/utils";
import { REVIEW_CARD } from "@/utils/labels";
import type { ReviewDTO } from "@/models";

export const ReviewCard = ({ review }: { review: ReviewDTO }) => {
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
            {review.author ?? REVIEW_CARD.anonymous} &middot;{" "}
            {formatDate(review.reviewedAt, REVIEW_CARD.unknownDate)}
            {review.country ? ` · ${review.country}` : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
