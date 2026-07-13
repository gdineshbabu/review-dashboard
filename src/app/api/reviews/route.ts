import { NextResponse } from "next/server";
import {
  listCountries,
  listProducts,
  listReviews,
  listSources,
} from "@/lib/reviews";
import { MIN_LIMIT, MIN_RATING, MAX_RATING, HTTP_STATUS } from "@/lib/constants";

// Reviews are read fresh from the DB on each request (no static caching).
export const dynamic = "force-dynamic";

/**
 * GET /api/reviews
 *
 * Query params:
 *   limit   - number of reviews to return (1..100, default 20)
 *   rating  - filter to an exact star rating (1..5)
 *   source  - filter to a specific source (e.g. "mock", "amazon")
 *   product - filter to a specific product name
 *   country - filter to a specific reviewer country
 *   q       - free-text search across author name, title, body, product
 *
 * Returns the latest reviews, newest first. This is the only path the dashboard
 * uses to read data — it never touches the upstream source directly.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limitParam = searchParams.get("limit");
  const ratingParam = searchParams.get("rating");
  const sourceParam = searchParams.get("source");
  const productParam = searchParams.get("product");
  const countryParam = searchParams.get("country");
  const searchParam = searchParams.get("q");

  const limit = limitParam ? Number(limitParam) : undefined;
  const rating = ratingParam ? Number(ratingParam) : undefined;

  if (limitParam && (!Number.isFinite(limit!) || limit! < MIN_LIMIT)) {
    return NextResponse.json(
      { error: "`limit` must be a positive number." },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }
  if (
    ratingParam &&
    (!Number.isInteger(rating!) || rating! < MIN_RATING || rating! > MAX_RATING)
  ) {
    return NextResponse.json(
      { error: `\`rating\` must be an integer between ${MIN_RATING} and ${MAX_RATING}.` },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  try {
    // Reviews respect the active filters; the *set* lists (sources/products/
    // countries) are the full, unfiltered sets so the dropdowns always list
    // every option.
    const [reviews, sources, products, countries] = await Promise.all([
      listReviews({
        limit,
        rating,
        source: sourceParam ?? undefined,
        product: productParam ?? undefined,
        country: countryParam ?? undefined,
        search: searchParam ?? undefined,
      }),
      listSources(),
      listProducts(),
      listCountries(),
    ]);
    return NextResponse.json({
      count: reviews.length,
      reviews,
      sources,
      products,
      countries,
    });
  } catch (err) {
    console.error("[api/reviews] failed to list reviews:", err);
    return NextResponse.json(
      { error: "Failed to load reviews. Is the database running and migrated?" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
