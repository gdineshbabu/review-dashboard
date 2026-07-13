/**
 * Central, named constants for values that would otherwise be "magic numbers"
 * or repeated string literals — especially the ones that drive conditions
 * (rating bounds, page limits, retry policy, the filter sentinel, HTTP codes).
 *
 * Keeping them in one place makes the rules easy to find, change once, and
 * reason about, and keeps the conditional logic self-documenting at the call
 * site (`rating >= POSITIVE_RATING_THRESHOLD` instead of `rating >= 4`).
 */

// --- Rating domain -----------------------------------------------------------
/** Lowest valid star rating. */
export const MIN_RATING = 1;
/** Highest valid star rating. */
export const MAX_RATING = 5;
/** Ratings greater than or equal to this count as "positive" (4–5★). */
export const POSITIVE_RATING_THRESHOLD = 4;
/** Star values, highest → lowest, for filter dropdowns and the breakdown chart. */
export const RATING_VALUES = [5, 4, 3, 2, 1] as const;

// --- Pagination / query limits ----------------------------------------------
/** Smallest page size a caller may request. */
export const MIN_LIMIT = 1;
/** Default number of reviews returned (the dashboard shows the latest 20). */
export const DEFAULT_LIMIT = 20;
/** Hard cap so a caller can't request an unbounded page. */
export const MAX_LIMIT = 100;

// --- Filters -----------------------------------------------------------------
/** Sentinel used by the filter dropdowns to mean "no filter applied". */
export const ALL_FILTER = "all";

// --- Ingestion / upstream resilience ----------------------------------------
/** How many times to attempt an upstream fetch before giving up. */
export const MAX_FETCH_ATTEMPTS = 4;
/** Base delay (ms) for exponential backoff between retries. */
export const BASE_BACKOFF_MS = 250;
/** HTTP status that signals rate limiting; retried with extra backoff. */
export const RATE_LIMIT_STATUS = 429;

// --- Normalization -----------------------------------------------------------
/** Author value (case-insensitive) treated as anonymous → stored as null. */
export const ANONYMOUS_AUTHOR = "anonymous";

// --- Synthetic data ----------------------------------------------------------
/** Reviews made available per product when REVIEWS_PER_PRODUCT is unset. */
export const DEFAULT_REVIEWS_PER_PRODUCT = 1000;

// --- REST API HTTP status codes ---------------------------------------------
/** Named HTTP status codes returned by the REST API. */
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;
