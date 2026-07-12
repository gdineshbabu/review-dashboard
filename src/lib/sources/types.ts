/**
 * A review exactly as it comes off an upstream source — intentionally loose.
 *
 * Real upstreams (Amazon, scraping APIs, etc.) return inconsistent, partial, and
 * sometimes malformed data. We model that here with optional/unknown-ish fields
 * and let the normalization layer (see `lib/normalize.ts`) turn this into the
 * strict shape our database expects. Keeping the raw type messy on purpose is
 * what lets the rest of the app stay clean.
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
