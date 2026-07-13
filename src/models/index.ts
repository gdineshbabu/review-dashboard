// Barrel for all domain types & interfaces.
export type {
  RawReview,
  FetchResult,
  FetchOptions,
  ReviewSource,
  KnownProduct,
  GeneratableProduct,
} from "./source";
export type {
  NormalizedReview,
  ReviewDTO,
  ListReviewsParams,
  ReviewStats,
  ProductSummary,
} from "./review";
export type {
  ReviewsResponse,
  FetchReviewsResult,
  IngestResult,
  ResolvedProduct,
} from "./api";
