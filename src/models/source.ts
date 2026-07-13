/**
 * Types describing upstream sources and the raw data they return.
 *
 * `RawReview` is intentionally loose — real upstreams return inconsistent,
 * partial, sometimes malformed data. The normalization layer turns this into the
 * strict `NormalizedReview` shape (see `models/review.ts`).
 */
export interface RawReview {
  /** Stable id from the source, if it provides one. */
  externalId?: string | null;
  productName?: string | null;
  /** May arrive as a number, a numeric string, or missing entirely. */
  rating?: number | string | null;
  title?: string | null;
  /** Body may live under a few different keys depending on the source. */
  body?: string | null;
  text?: string | null;
  content?: string | null;
  author?: string | null;
  /** Reviewer country. May be a clean name, an Amazon "Reviewed in X" blob, or missing. */
  country?: string | null;
  location?: string | null;
  /** Date may be an ISO string, a human string, a timestamp, or missing. */
  date?: string | number | null;
  reviewedAt?: string | number | null;
}

/** Result of a single fetch attempt from a source. */
export interface FetchResult {
  source: string;
  reviews: RawReview[];
}

/** Options that scope a single fetch. */
export interface FetchOptions {
  /** Fetch only this product's reviews. Omit to fetch everything the source has. */
  asin?: string;
}

/**
 * The contract every upstream implements. Swapping mock -> real Amazon (or any
 * other store) is just another class behind this interface; nothing downstream
 * changes.
 */
export interface ReviewSource {
  /** Short machine name persisted on each review, e.g. "amazon" or "mock". */
  readonly name: string;
  /** Whether this source is usable in the current environment (keys present, etc.). */
  isEnabled(): boolean;
  /**
   * Fetch raw reviews. May throw or be slow — callers must handle both. Pass an
   * `asin` to scope the fetch to a single product; omit it to fetch everything.
   */
  fetchReviews(options?: FetchOptions): Promise<RawReview[]>;
}

/** A product we know how to ingest, keyed by Amazon ASIN. */
export interface KnownProduct {
  asin: string;
  productName: string;
  /** Short display label for chips/menus. */
  label: string;
  shortLink: string;
}

/** Minimal product shape the synthetic generator needs. */
export interface GeneratableProduct {
  asin: string;
  productName: string;
}
