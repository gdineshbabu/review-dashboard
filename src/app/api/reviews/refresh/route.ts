import { NextResponse } from "next/server";
import { ingestReviews } from "@/backend/ingest";

export const dynamic = "force-dynamic";
// Ingestion involves retries/backoff, so give it more headroom than a page load.
export const maxDuration = 30;

/**
 * POST /api/reviews/refresh
 *
 * Triggers the ingestion pipeline (fetch -> normalize -> dedupe -> store) and
 * returns a summary. Powers the dashboard's "Refresh" button. Kept separate from
 * the read path so displaying reviews never depends on the upstream being up.
 */
export const POST = async () => {
  try {
    const result = await ingestReviews();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    // A failed upstream (after all retries) is an expected, handled outcome —
    // report it as a 502 rather than a generic crash.
    console.error("[api/reviews/refresh] ingestion failed:", err);
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
