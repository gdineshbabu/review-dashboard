import { prisma } from "./db";

/** Shape the dashboard/API consumers receive (dates as ISO strings). */
export interface ReviewDTO {
  id: string;
  source: string;
  productName: string;
  rating: number;
  title: string | null;
  body: string;
  author: string | null;
  reviewedAt: string;
}

export interface ListReviewsParams {
  limit?: number;
  rating?: number;
  source?: string;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

/**
 * List reviews newest-first with optional rating/source filters.
 *
 * Defaults to the latest 20, which is exactly what the dashboard needs. Limit is
 * clamped so a caller can't ask for an unbounded page.
 */
export async function listReviews(
  params: ListReviewsParams = {},
): Promise<ReviewDTO[]> {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  const where: { rating?: number; source?: string } = {};
  if (params.rating && params.rating >= 1 && params.rating <= 5) {
    where.rating = params.rating;
  }
  if (params.source) {
    where.source = params.source;
  }

  const rows = await prisma.review.findMany({
    where,
    orderBy: [{ reviewedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    productName: r.productName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    author: r.author,
    reviewedAt: r.reviewedAt.toISOString(),
  }));
}

/** Distinct sources present in the DB — powers the filter dropdown. */
export async function listSources(): Promise<string[]> {
  const rows = await prisma.review.findMany({
    distinct: ["source"],
    select: { source: true },
    orderBy: { source: "asc" },
  });
  return rows.map((r) => r.source);
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  /** Count of reviews per star rating, keyed "1".."5". */
  distribution: Record<string, number>;
  /** Percentage (0..100) of reviews that are 4 or 5 stars. */
  positiveShare: number;
  sourceCount: number;
  /** ISO timestamp of the most recently written review, or null if empty. */
  latestReviewedAt: string | null;
}

/**
 * Aggregate stats for the whole dataset (unfiltered), computed in the DB via
 * groupBy so we never pull every row into memory just to count them. Powers the
 * dashboard summary cards and the rating-distribution chart.
 */
export async function getReviewStats(): Promise<ReviewStats> {
  const [grouped, latest, sources] = await Promise.all([
    prisma.review.groupBy({
      by: ["rating"],
      _count: { _all: true },
    }),
    prisma.review.findFirst({
      orderBy: { reviewedAt: "desc" },
      select: { reviewedAt: true },
    }),
    listSources(),
  ]);

  const distribution: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  let total = 0;
  let weightedSum = 0;
  for (const g of grouped) {
    const count = g._count._all;
    distribution[String(g.rating)] = count;
    total += count;
    weightedSum += g.rating * count;
  }

  const averageRating = total > 0 ? weightedSum / total : 0;
  const positive = distribution["4"] + distribution["5"];
  const positiveShare = total > 0 ? (positive / total) * 100 : 0;

  return {
    total,
    averageRating: Math.round(averageRating * 10) / 10,
    distribution,
    positiveShare: Math.round(positiveShare),
    sourceCount: sources.length,
    latestReviewedAt: latest?.reviewedAt.toISOString() ?? null,
  };
}
