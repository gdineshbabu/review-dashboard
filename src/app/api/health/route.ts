import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Lightweight liveness probe for Railway/Render. Does not touch the database so
 * the deploy healthcheck can pass even before the first seed/migration settles.
 */
export const GET = async () => {
  return NextResponse.json({ ok: true });
};
