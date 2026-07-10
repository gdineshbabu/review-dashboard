/**
 * Seed the database with the fixture reviews.
 *
 * Uses a non-flaky mock source (no simulated failures) so seeding is fast and
 * deterministic — handy for a first run or a demo. Ingestion is idempotent, so
 * running this repeatedly is safe: existing reviews are skipped as duplicates.
 *
 * Run with: npm run seed
 */
import { ingestReviews } from "../src/lib/ingest";
import { MockReviewSource } from "../src/lib/sources";

async function main() {
  const source = new MockReviewSource({
    failureRate: 0,
    rateLimitRate: 0,
    minLatencyMs: 0,
    maxLatencyMs: 0,
  });

  const result = await ingestReviews(source);
  console.log(
    `Seed complete: inserted ${result.inserted}, ` +
      `skipped ${result.duplicates} existing, dropped ${result.dropped} unusable.`,
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
