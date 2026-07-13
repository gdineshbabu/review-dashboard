import type { ProductSummary, ReviewDTO } from "./review";

/** Response body of `GET /api/reviews`. */
export interface ReviewsResponse {
  count: number;
  reviews: ReviewDTO[];
  sources: string[];
  products: ProductSummary[];
  countries: string[];
}

/** Result of a fetch to our own reviews API (server component helper). */
export type FetchReviewsResult =
  | { ok: true; data: ReviewsResponse }
  | { ok: false; error: string };

/** Summary returned by the ingestion pipeline. */
export interface IngestResult {
  source: string;
  fetched: number;
  dropped: number;
  inserted: number;
  duplicates: number;
  attempts: number;
}

/** Result of resolving a user-pasted Amazon link to a product. */
export interface ResolvedProduct {
  asin: string;
  /** The canonical URL we resolved to (after following any redirect). */
  canonicalUrl: string;
}
