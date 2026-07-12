import type { FetchOptions, RawReview, ReviewSource } from "./types";
import { fixtureReviewsForAsin, fullDataset } from "./catalog";

/** Deterministic-ish 0..1 value derived from an integer seed. */
function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface MockSourceOptions {
  /** Probability (0..1) that a fetch attempt fails outright. */
  failureRate?: number;
  /** Probability (0..1) that a fetch is throttled with a rate-limit error. */
  rateLimitRate?: number;
  /** Simulated network latency bounds, in ms. */
  minLatencyMs?: number;
  maxLatencyMs?: number;
}

/**
 * A stand-in for a real upstream that runs with zero credentials.
 *
 * Beyond returning fixture data, it deliberately simulates the failure modes the
 * task calls out — slowness, transient failures, and rate limiting — so the
 * ingestion layer's retry/backoff and error handling get genuinely exercised.
 *
 * The seed mixes a wall-clock component with an attempt counter so that (a)
 * different fetch attempts within one retry loop get different outcomes and
 * (b) failures actually surface across requests instead of being pinned to a
 * fixed per-instance value. Set failureRate/rateLimitRate to 0 (see the seed
 * script) when you want deterministic, always-successful behaviour.
 */
export class MockReviewSource implements ReviewSource {
  readonly name = "mock";

  private attempt = 0;
  private readonly failureRate: number;
  private readonly rateLimitRate: number;
  private readonly minLatencyMs: number;
  private readonly maxLatencyMs: number;

  constructor(opts: MockSourceOptions = {}) {
    this.failureRate = opts.failureRate ?? 0.25;
    this.rateLimitRate = opts.rateLimitRate ?? 0.15;
    this.minLatencyMs = opts.minLatencyMs ?? 150;
    this.maxLatencyMs = opts.maxLatencyMs ?? 600;
  }

  isEnabled(): boolean {
    return true;
  }

  async fetchReviews(options?: FetchOptions): Promise<RawReview[]> {
    // Mix wall-clock time with the attempt counter so outcomes genuinely vary
    // across attempts and across requests. When both rates are 0 the seed is
    // irrelevant and the source always succeeds.
    const seed = Date.now() + ++this.attempt * 1000;

    // Simulate variable network latency.
    const latency =
      this.minLatencyMs +
      seeded(seed) * (this.maxLatencyMs - this.minLatencyMs);
    await new Promise((r) => setTimeout(r, latency));

    // Simulate a rate-limit response (429-style) on some attempts.
    if (seeded(seed * 7) < this.rateLimitRate) {
      const err = new Error("mock upstream: rate limited (429)");
      (err as { status?: number }).status = 429;
      throw err;
    }

    // Simulate a transient upstream failure on some attempts.
    if (seeded(seed * 13) < this.failureRate) {
      throw new Error("mock upstream: transient fetch failure (503)");
    }

    // Scoped fetch: return only the requested product's reviews (empty if we
    // have none for that ASIN). Otherwise return the full multi-product dataset.
    if (options?.asin) {
      return fixtureReviewsForAsin(options.asin);
    }
    return fullDataset();
  }
}
