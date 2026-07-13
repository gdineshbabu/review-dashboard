import { NextResponse } from "next/server";
import { getReviewStats } from "@/lib/reviews";
import { HTTP_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/stats
 *
 * Aggregate metrics across all stored reviews — total, average rating, rating
 * distribution, positive share, source count. Drives the dashboard summary.
 */
export async function GET() {
  try {
    const stats = await getReviewStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[api/stats] failed to compute stats:", err);
    return NextResponse.json(
      { error: "Failed to load stats. Is the database running and migrated?" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
