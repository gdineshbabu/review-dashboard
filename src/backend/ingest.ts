import { prisma } from "./db";
import { normalizeBatch } from "./normalize";
import { resolveReviewSource } from "./sources";
import type { FetchOptions, IngestResult, ReviewSource } from "@/models";

/** Sleep helper. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch with bounded retries and exponential backoff.
 *
 * Real upstreams are slow, flaky, and rate-limited (the mock source simulates
 * all three). We retry a few times with growing delays — a touch longer when the
 * error looks like a 429 — and give up cleanly after `maxAttempts` so a bad
 * upstream degrades gracefully instead of hanging a request.
 */
const fetchWithRetry = async (
  source: ReviewSource,
  options: FetchOptions,
  maxAttempts = 4,
): Promise<{ reviews: Awaited<ReturnType<ReviewSource["fetchReviews"]>>; attempts: number }> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const reviews = await source.fetchReviews(options);
      return { reviews, attempts: attempt };
    } catch (err) {
      lastError = err;
      const isRateLimited = (err as { status?: number })?.status === 429;
      if (attempt === maxAttempts) break;

      // Exponential backoff (250ms, 500ms, 1000ms...), longer for rate limits.
      const base = 250 * 2 ** (attempt - 1);
      const backoff = isRateLimited ? base * 2 : base;
      console.warn(
        `[ingest] ${source.name} fetch attempt ${attempt}/${maxAttempts} failed ` +
          `(${(err as Error).message}); retrying in ${backoff}ms`,
      );
      await sleep(backoff);
    }
  }

  throw new Error(
    `[ingest] ${source.name} failed after ${maxAttempts} attempts: ` +
      `${(lastError as Error)?.message ?? "unknown error"}`,
  );
};

/**
 * The ingestion pipeline: fetch -> normalize -> dedupe -> store.
 *
 * Dedup is enforced at the database level via the unique (source, externalId)
 * constraint. We de-duplicate the batch against itself first, then insert with
 * `createMany({ skipDuplicates })` — a single round-trip that scales to thousands
 * of rows and is concurrency-safe (ON CONFLICT DO NOTHING handles races between
 * simultaneous refreshes). `inserted` is exactly what the DB accepted; the rest
 * were already present. This is what satisfies "don't re-fetch what you already have".
 */
export const ingestReviews = async (
  source: ReviewSource = resolveReviewSource(),
  options: FetchOptions = {},
): Promise<IngestResult> => {
  const { reviews, attempts } = await fetchWithRetry(source, options);
  const { valid, dropped } = normalizeBatch(source.name, reviews);

  // Collapse duplicate externalIds within this batch so counts stay accurate.
  const seen = new Set<string>();
  const unique = valid.filter((r) => {
    if (seen.has(r.externalId)) return false;
    seen.add(r.externalId);
    return true;
  });

  const created = await prisma.review.createMany({
    data: unique,
    skipDuplicates: true,
  });
  const inserted = created.count;
  const duplicates = valid.length - inserted;

  const result: IngestResult = {
    source: source.name,
    fetched: reviews.length,
    dropped,
    inserted,
    duplicates,
    attempts,
  };

  console.info(`[ingest] done: ${JSON.stringify(result)}`);
  return result;
};
