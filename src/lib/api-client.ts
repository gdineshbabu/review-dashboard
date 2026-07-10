import type { ReviewDTO, ReviewStats } from "./reviews";

export interface ReviewsResponse {
  count: number;
  reviews: ReviewDTO[];
  sources: string[];
}

/** Absolute base URL for server-side fetches to our own API. */
function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Fetch reviews from OUR REST API (not the upstream source).
 *
 * The dashboard is a server component but still goes through the public API on
 * purpose — that's the boundary the task asks for (display reads the DB via the
 * REST API, never the upstream directly). Returns a typed result plus an `ok`
 * flag so the page can render an honest error state instead of throwing.
 */
export async function fetchReviews(searchParams: {
  rating?: string;
  source?: string;
}): Promise<{ ok: true; data: ReviewsResponse } | { ok: false; error: string }> {
  const params = new URLSearchParams({ limit: "20" });
  if (searchParams.rating) params.set("rating", searchParams.rating);
  if (searchParams.source) params.set("source", searchParams.source);

  try {
    const res = await fetch(`${baseUrl()}/api/reviews?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: body.error ?? `Request failed with status ${res.status}.`,
      };
    }
    return { ok: true, data: (await res.json()) as ReviewsResponse };
  } catch {
    return {
      ok: false,
      error: "Could not reach the API. Is the dev server running?",
    };
  }
}

/** Fetch aggregate stats from our REST API. Returns null on failure so the
 * dashboard can hide the summary rather than error the whole page. */
export async function fetchStats(): Promise<ReviewStats | null> {
  try {
    const res = await fetch(`${baseUrl()}/api/stats`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ReviewStats;
  } catch {
    return null;
  }
}
