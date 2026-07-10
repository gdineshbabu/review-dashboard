import { Suspense } from "react";
import {
  Inbox,
  AlertTriangle,
  MessagesSquare,
  Star,
  ThumbsUp,
  Store,
  Activity,
} from "lucide-react";
import { fetchReviews, fetchStats } from "@/lib/api-client";
import { ReviewCard } from "@/components/review-card";
import { ReviewFilters } from "@/components/review-filters";
import { RefreshButton } from "@/components/refresh-button";
import { StatCard } from "@/components/stat-card";
import { RatingDistribution } from "@/components/rating-distribution";

// This page always reflects the current DB state, so render it dynamically.
export const dynamic = "force-dynamic";

function formatUpdated(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string; source?: string }>;
}) {
  const params = await searchParams;
  const [result, stats] = await Promise.all([
    fetchReviews(params),
    fetchStats(),
  ]);
  const isFiltered = Boolean(params.rating || params.source);
  const hasData = Boolean(stats && stats.total > 0);

  return (
    <div className="min-h-screen bg-[var(--color-muted)]/40">
      {/* App bar */}
      <header className="sticky top-0 z-10 border-b bg-[var(--color-background)]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]">
              <Activity className="h-5 w-5 text-[var(--color-primary-foreground)]" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">
                The Review Dash
              </h1>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                AliveCor product reviews
              </p>
            </div>
          </div>
          <RefreshButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {/* Summary */}
        {hasData && stats && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label="Total reviews"
                value={String(stats.total)}
                icon={MessagesSquare}
              />
              <StatCard
                label="Average rating"
                value={stats.averageRating.toFixed(1)}
                hint="out of 5 stars"
                icon={Star}
              />
              <StatCard
                label="Positive (4–5★)"
                value={`${stats.positiveShare}%`}
                hint="of all reviews"
                icon={ThumbsUp}
              />
              <StatCard
                label="Sources"
                value={String(stats.sourceCount)}
                hint={`updated ${formatUpdated(stats.latestReviewedAt)}`}
                icon={Store}
              />
            </div>
            <RatingDistribution stats={stats} />
          </section>
        )}

        {/* Latest reviews */}
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Latest reviews</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Showing the 20 most recent, newest first.
              </p>
            </div>
            <Suspense fallback={<div className="h-9" />}>
              <ReviewFilters sources={result.ok ? result.data.sources : []} />
            </Suspense>
          </div>

          {!result.ok ? (
            <ErrorState message={result.error} />
          ) : result.data.reviews.length === 0 ? (
            <EmptyState isFiltered={isFiltered} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-[var(--color-background)] py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-[var(--color-destructive)]" />
      <p className="font-medium">Something went wrong</p>
      <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">
        {message}
      </p>
    </div>
  );
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-[var(--color-background)] py-16 text-center">
      <Inbox className="h-8 w-8 text-[var(--color-muted-foreground)]" />
      <p className="font-medium">
        {isFiltered ? "No reviews match these filters" : "No reviews yet"}
      </p>
      <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">
        {isFiltered
          ? "Try clearing the rating or source filter."
          : 'Click "Refresh reviews" to pull the latest reviews into the dashboard.'}
      </p>
    </div>
  );
}
