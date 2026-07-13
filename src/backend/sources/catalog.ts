import { FIXTURE_REVIEWS } from "./fixtures";
import { generateProductReviews } from "./review-generator";
import type { KnownProduct, RawReview } from "@/models";
import {
  DEFAULT_REVIEWS_PER_PRODUCT,
  PRODUCT_CATALOG,
  PRODUCT_SEEDS,
} from "@/utils/constants";

/** Look up a known product by ASIN (case-insensitive). */
export const productForAsin = (asin: string): KnownProduct | undefined => {
  const upper = asin.trim().toUpperCase();
  return PRODUCT_CATALOG.find((p) => p.asin === upper);
};

/**
 * How many reviews to make available per product. Configurable via
 * REVIEWS_PER_PRODUCT (default 1000). The curated hand-written fixtures count
 * toward this and stay the newest rows; the rest are topped up synthetically.
 */
const reviewsPerProduct = (): number => {
  const raw = Number(process.env.REVIEWS_PER_PRODUCT);
  return Number.isFinite(raw) && raw > 0
    ? Math.floor(raw)
    : DEFAULT_REVIEWS_PER_PRODUCT;
};

// Memoize per target-count so we don't regenerate thousands of rows every fetch.
const datasetCache = new Map<string, RawReview[]>();

/** Curated + synthetic reviews for a single product, up to the target count. */
const buildProductReviews = (product: KnownProduct, count: number): RawReview[] => {
  const curated = FIXTURE_REVIEWS.filter(
    (r) => r.productName === product.productName,
  ).map((r) => ({ ...r }));

  const remaining = Math.max(0, count - curated.length);
  const generated = generateProductReviews(
    product,
    remaining,
    PRODUCT_SEEDS[product.asin] ?? 42,
  );
  return [...curated, ...generated];
};

/** Reviews for a single product by ASIN (empty for an unknown ASIN). */
export const fixtureReviewsForAsin = (asin: string): RawReview[] => {
  const product = productForAsin(asin);
  if (!product) return [];
  const count = reviewsPerProduct();
  const key = `${product.asin}:${count}`;
  let cached = datasetCache.get(key);
  if (!cached) {
    cached = buildProductReviews(product, count);
    datasetCache.set(key, cached);
  }
  return cached.map((r) => ({ ...r }));
};

/** The full dataset across every catalog product (all products, unscoped). */
export const fullDataset = (): RawReview[] =>
  PRODUCT_CATALOG.flatMap((p) => fixtureReviewsForAsin(p.asin));
