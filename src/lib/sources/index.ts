import type { ReviewSource } from "./types";
import { MockReviewSource } from "./mock-source";
import { AmazonReviewSource } from "./amazon-source";

export type { ReviewSource, RawReview, FetchOptions } from "./types";
export { MockReviewSource } from "./mock-source";
export { AmazonReviewSource } from "./amazon-source";
export {
  PRODUCT_CATALOG,
  productForAsin,
  type KnownProduct,
} from "./catalog";

/**
 * Resolve which source to ingest from based on the REVIEW_SOURCE env var.
 *
 * Selecting "amazon" without a configured AMAZON_API_KEY is a soft failure: we
 * log a warning and fall back to the mock source so the app still runs from a
 * clean clone. This is intentional — the default path must never require a key.
 */
export function resolveReviewSource(): ReviewSource {
  const requested = (process.env.REVIEW_SOURCE ?? "mock").toLowerCase();

  if (requested === "amazon") {
    const amazon = new AmazonReviewSource();
    if (amazon.isEnabled()) return amazon;
    console.warn(
      "[sources] REVIEW_SOURCE=amazon but AMAZON_API_KEY is not set; falling back to mock source.",
    );
  }

  return new MockReviewSource();
}
