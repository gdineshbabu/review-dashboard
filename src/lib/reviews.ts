import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_LIMIT,
  MIN_RATING,
  MAX_RATING,
  POSITIVE_RATING_THRESHOLD,
} from "./constants";

/** Shape the dashboard/API consumers receive (dates as ISO strings). */
export interface ReviewDTO {
  id: string;
  source: string;
  productName: string;
  rating: number;
  title: string | null;
  body: string;
  author: string | null;
  country: string | null;
  reviewedAt: string;
}

export interface ListReviewsParams {
  limit?: number;
  rating?: number;
  source?: string;
  product?: string;
  country?: string;
  /** Free-text search across author name, title, body and product name. */
  search?: string;
}

/**
 * List reviews newest-first with optional rating/source filters.
 *
 * Defaults to the latest 20, which is exactly what the dashboard needs. Limit is
 * clamped so a caller can't ask for an unbounded page.
 */
export async function listReviews(
  params: ListReviewsParams = {},
): Promise<ReviewDTO[]> {
  const limit = Math.min(
    Math.max(params.limit ?? DEFAULT_LIMIT, MIN_LIMIT),
    MAX_LIMIT,
  );

  const where: Prisma.ReviewWhereInput = {};
  if (params.rating && params.rating >= MIN_RATING && params.rating <= MAX_RATING) {
    where.rating = params.rating;
  }
  if (params.source) {
    where.source = params.source;
  }
  if (params.product) {
    where.productName = params.product;
  }
  if (params.country) {
    where.country = params.country;
  }

  // Free-text search: case-insensitive match on author (name), title, body, or
  // product. Combined with the filters above as AND (all must hold).
  const search = params.search?.trim();
  if (search) {
    where.OR = [
      { author: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
      { productName: { contains: search, mode: "insensitive" } },
    ];
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
    country: r.country,
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

/** Distinct non-null countries present in the DB — powers the country filter. */
export async function listCountries(): Promise<string[]> {
  const rows = await prisma.review.findMany({
    where: { country: { not: null } },
    distinct: ["country"],
    select: { country: true },
    orderBy: { country: "asc" },
  });
  return rows.map((r) => r.country!).filter(Boolean);
}

export interface ProductSummary {
  productName: string;
  count: number;
}

/**
 * Distinct products present in the DB with a review count each — powers the
 * product filter and the "which products do we have" view. Counted in the DB via
 * groupBy so we don't pull rows just to tally them.
 */
export async function listProducts(): Promise<ProductSummary[]> {
  const grouped = await prisma.review.groupBy({
    by: ["productName"],
    _count: { _all: true },
    orderBy: { productName: "asc" },
  });
  return grouped.map((g) => ({
    productName: g.productName,
    count: g._count._all,
  }));
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
  let positive = 0;
  for (const g of grouped) {
    const count = g._count._all;
    distribution[String(g.rating)] = count;
    total += count;
    weightedSum += g.rating * count;
    if (g.rating >= POSITIVE_RATING_THRESHOLD) positive += count;
  }

  const averageRating = total > 0 ? weightedSum / total : 0;
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
