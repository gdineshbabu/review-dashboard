/** Types for reviews as they flow through normalization, storage, and the API. */

/** The strict, validated shape our database and API speak. */
export interface NormalizedReview {
  source: string;
  externalId: string;
  productName: string;
  rating: number;
  title: string | null;
  body: string;
  author: string | null;
  country: string | null;
  reviewedAt: Date;
}

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

export interface ProductSummary {
  productName: string;
  count: number;
}
