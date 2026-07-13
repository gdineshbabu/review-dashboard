import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { STATS } from "@/utils/labels";
import { RATING_VALUES } from "@/backend/constants";
import type { ReviewStats } from "@/models";

/**
 * Horizontal bar chart of how reviews break down by star rating (5 -> 1).
 * Built with plain divs — no charting dependency needed for a five-row bar.
 */
export const RatingDistribution = ({ stats }: { stats: ReviewStats }) => {
  const max = Math.max(1, ...Object.values(stats.distribution));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">
          {STATS.ratingBreakdown}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {RATING_VALUES.map((star) => {
          const count = stats.distribution[String(star)] ?? 0;
          const widthPct = (count / max) * 100;
          const share = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="flex w-10 shrink-0 items-center gap-1 text-[var(--color-muted-foreground)]">
                {star}
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--color-secondary)]">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${widthPct}%` }}
                  aria-hidden
                />
              </div>
              <span className="w-16 shrink-0 text-right text-xs text-[var(--color-muted-foreground)]">
                {count} ({Math.round(share)}%)
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
