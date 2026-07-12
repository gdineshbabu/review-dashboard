import { FIXTURE_REVIEWS } from "./fixtures";
import { generateProductReviews } from "./review-generator";
import type { RawReview } from "./types";

/**
 * The products we know how to ingest, keyed by Amazon ASIN.
 *
 * ASINs were resolved from the amzn.in short-links in TASK.md; the productName is
 * the value the fixtures/generator use for that product (so scoping a fetch by
 * ASIN returns exactly that product's reviews). A real Amazon integration would
 * key off the same ASINs — see `amazon-source.ts`.
 */
export interface KnownProduct {
  asin: string;
  productName: string;
  /** Short display label for chips/menus. */
  label: string;
  shortLink: string;
}

export const PRODUCT_CATALOG: KnownProduct[] = [
  {
    asin: "B01A4W8AUK",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    label: "KardiaMobile 1-Lead",
    shortLink: "https://amzn.in/d/01qnlA6F",
  },
  {
    asin: "B07RQW6SD5",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    label: "KardiaMobile 6L",
    shortLink: "https://amzn.in/d/07vKnqI2",
  },
  {
    asin: "B09TQ3ZN8V",
    productName: "KardiaMobile Card - Credit Card Sized EKG",
    label: "KardiaMobile Card",
    shortLink: "https://amzn.in/d/03eooMZA",
  },
];

/** Look up a known product by ASIN (case-insensitive). */
export function productForAsin(asin: string): KnownProduct | undefined {
  const upper = asin.trim().toUpperCase();
  return PRODUCT_CATALOG.find((p) => p.asin === upper);
}

/**
 * How many reviews to make available per product. Configurable via
 * REVIEWS_PER_PRODUCT (default 1000). The curated hand-written fixtures count
 * toward this and stay the newest rows; the rest are topped up synthetically.
 */
function reviewsPerProduct(): number {
  const raw = Number(process.env.REVIEWS_PER_PRODUCT);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1000;
}

// Deterministic seeds per product so each product's synthetic stream is stable.
const PRODUCT_SEEDS: Record<string, number> = {
  B01A4W8AUK: 1_000_003,
  B07RQW6SD5: 2_000_003,
  B09TQ3ZN8V: 3_000_003,
};

// Memoize per target-count so we don't regenerate thousands of rows every fetch.
const datasetCache = new Map<string, RawReview[]>();

/** Curated + synthetic reviews for a single product, up to the target count. */
function buildProductReviews(product: KnownProduct, count: number): RawReview[] {
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
}

/** Reviews for a single product by ASIN (empty for an unknown ASIN). */
export function fixtureReviewsForAsin(asin: string): RawReview[] {
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
}

/** The full dataset across every catalog product (all products, unscoped). */
export function fullDataset(): RawReview[] {
  return PRODUCT_CATALOG.flatMap((p) => fixtureReviewsForAsin(p.asin));
}
