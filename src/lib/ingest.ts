import { prisma } from "./db";
import { normalizeBatch } from "./normalize";
import { resolveReviewSource, type ReviewSource } from "./sources";

export interface IngestResult {
  source: string;
  fetched: number;
  dropped: number;
  inserted: number;
  duplicates: number;
  attempts: number;
}

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
async function fetchWithRetry(
  source: ReviewSource,
  maxAttempts = 4,
): Promise<{ reviews: Awaited<ReturnType<ReviewSource["fetchReviews"]>>; attempts: number }> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const reviews = await source.fetchReviews();
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
}

/**
 * The ingestion pipeline: fetch -> normalize -> dedupe -> store.
 *
 * Dedup is handled at the database level via the unique (source, externalId)
 * constraint. We use a per-row upsert inside a transaction: rows we already have
 * are counted as duplicates and left untouched, new rows are inserted. This is
 * what satisfies "don't re-fetch what you already have".
 */
export async function ingestReviews(
  source: ReviewSource = resolveReviewSource(),
): Promise<IngestResult> {
  const { reviews, attempts } = await fetchWithRetry(source);
  const { valid, dropped } = normalizeBatch(source.name, reviews);

  let inserted = 0;
  let duplicates = 0;

  // Upsert each review. Doing these individually (rather than createMany with
  // skipDuplicates) lets us accurately report inserted-vs-duplicate counts,
  // which is useful signal for an internal tool.
  await prisma.$transaction(async (tx) => {
    for (const r of valid) {
      const existing = await tx.review.findUnique({
        where: {
          source_externalId: { source: r.source, externalId: r.externalId },
        },
        select: { id: true },
      });

      if (existing) {
        duplicates++;
        continue;
      }

      await tx.review.create({ data: r });
      inserted++;
    }
  });

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
}
