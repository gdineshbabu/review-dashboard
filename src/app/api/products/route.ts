import { NextResponse } from "next/server";
import { ingestReviews } from "@/backend/ingest";
import { listProducts } from "@/backend/reviews";
import { resolveAmazonUrl } from "@/backend/amazon-url";
import { productForAsin } from "@/backend/sources";

export const dynamic = "force-dynamic";
// Resolving a short-link + ingesting with retries can take a few seconds.
export const maxDuration = 30;

/**
 * GET /api/products
 *
 * Distinct products in the DB with a review count each. Powers the product
 * filter and gives an at-a-glance "what have we ingested" view.
 */
export const GET = async () => {
  try {
    const products = await listProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[api/products] failed to list products:", err);
    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 },
    );
  }
};

/**
 * POST /api/products
 *
 * Body: { url: string } — an Amazon product link or amzn.in short-link.
 *
 * Resolves the link to an ASIN and ingests that product's reviews into the DB
 * (deduped like any other ingest). This is the "add items using the links" flow:
 * the link is the input, the stored+deduped reviews are the output.
 */
export const POST = async (request: Request) => {
  let url: unknown;
  try {
    ({ url } = await request.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected a JSON body with a `url` field." },
      { status: 400 },
    );
  }

  if (typeof url !== "string" || url.trim() === "") {
    return NextResponse.json(
      { ok: false, error: "Please provide a product `url`." },
      { status: 400 },
    );
  }

  const resolved = await resolveAmazonUrl(url);
  if (!resolved) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Couldn't read an Amazon product from that link. Paste an amazon.in product URL or an amzn.in share link.",
      },
      { status: 422 },
    );
  }

  const known = productForAsin(resolved.asin);

  try {
    // Scope ingestion to just this product. With the default mock source we only
    // have fixtures for the catalog ASINs; an unknown one ingests nothing, which
    // we report honestly rather than as an error.
    const result = await ingestReviews(undefined, { asin: resolved.asin });

    if (result.fetched === 0) {
      return NextResponse.json(
        {
          ok: false,
          asin: resolved.asin,
          error:
            "No reviews are available for that product from the current source. " +
            "The mock source ships fixtures for the three KardiaMobile products; " +
            "set AMAZON_API_KEY to pull arbitrary products live.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      asin: resolved.asin,
      productName: known?.productName ?? null,
      ...result,
    });
  } catch (err) {
    console.error("[api/products] ingestion failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Ingestion failed after retries. The upstream source may be down or rate-limited. Try again.",
      },
      { status: 502 },
    );
  }
};
