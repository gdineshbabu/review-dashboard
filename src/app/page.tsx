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
import { fetchReviews, fetchStats } from "@/backend/api-client";
import {
  ReviewCard,
  ReviewFilters,
  SearchBox,
  RefreshButton,
  AddProductForm,
  StatCard,
  RatingDistribution,
} from "@/frontend/components";
import { PRODUCT_CATALOG } from "@/utils/constants";
import { formatDate } from "@/utils";
import { APP, STATS, REVIEWS } from "@/utils/labels";

// This page always reflects the current DB state, so render it dynamically.
export const dynamic = "force-dynamic";

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    rating?: string;
    source?: string;
    product?: string;
    country?: string;
    q?: string;
  }>;
}) => {
  const params = await searchParams;
  const [result, stats] = await Promise.all([
    fetchReviews(params),
    fetchStats(),
  ]);
  const isFiltered = Boolean(
    params.rating || params.source || params.product || params.country || params.q,
  );
  const hasData = Boolean(stats && stats.total > 0);
  const knownProducts = PRODUCT_CATALOG.map((p) => ({
    label: p.label,
    shortLink: p.shortLink,
  }));

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
                {APP.title}
              </h1>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {APP.subtitle}
              </p>
            </div>
          </div>
          <RefreshButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {/* Add a product by link */}
        <AddProductForm knownProducts={knownProducts} />

        {/* Summary */}
        {hasData && stats && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                label={STATS.total}
                value={String(stats.total)}
                icon={MessagesSquare}
              />
              <StatCard
                label={STATS.average}
                value={stats.averageRating.toFixed(1)}
                hint={STATS.averageHint}
                icon={Star}
              />
              <StatCard
                label={STATS.positive}
                value={`${stats.positiveShare}%`}
                hint={STATS.positiveHint}
                icon={ThumbsUp}
              />
              <StatCard
                label={STATS.sources}
                value={String(stats.sourceCount)}
                hint={STATS.updated(formatDate(stats.latestReviewedAt))}
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
              <h2 className="text-lg font-semibold">{REVIEWS.heading}</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {REVIEWS.subheading}
              </p>
            </div>
            <Suspense fallback={<div className="h-9" />}>
              <div className="flex w-full flex-col gap-3 sm:w-auto lg:flex-row lg:items-center">
                <SearchBox />
                <ReviewFilters
                  sources={result.ok ? result.data.sources : []}
                  products={result.ok ? result.data.products : []}
                  countries={result.ok ? result.data.countries : []}
                />
              </div>
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
};

export default DashboardPage;

const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-[var(--color-background)] py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-[var(--color-destructive)]" />
      <p className="font-medium">{REVIEWS.errorTitle}</p>
      <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">
        {message}
      </p>
    </div>
  );
};

const EmptyState = ({ isFiltered }: { isFiltered: boolean }) => {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-[var(--color-background)] py-16 text-center">
      <Inbox className="h-8 w-8 text-[var(--color-muted-foreground)]" />
      <p className="font-medium">
        {isFiltered ? REVIEWS.emptyFilteredTitle : REVIEWS.emptyTitle}
      </p>
      <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">
        {isFiltered ? REVIEWS.emptyFilteredHint : REVIEWS.emptyHint}
      </p>
    </div>
  );
};
