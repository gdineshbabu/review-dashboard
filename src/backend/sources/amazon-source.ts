import type { FetchOptions, RawReview, ReviewSource } from "@/models";
import { PRODUCT_CATALOG } from "@/utils/constants";

/**
 * Real Amazon review source.
 *
 * Amazon has no public reviews API and directly scraping product pages requires
 * rotating proxies / CAPTCHA handling and violates their Terms of Service. In a
 * production build this class would call a licensed scraping-API provider
 * (Rainforest API, ScraperAPI, Oxylabs, etc.) that returns structured reviews
 * for a given ASIN.
 *
 * Per the assignment rules ("if a source needs a key, mock it and document it"),
 * the network call is intentionally left as a documented stub: the class is only
 * enabled when AMAZON_API_KEY is set, and the registry falls back to the mock
 * source otherwise. This keeps the seam realistic without shipping a scraper or
 * requiring a paid key to run the app.
 */

// ASINs resolved from the product short-links in TASK.md, sourced from the shared
// catalog so there's a single source of truth.
const PRODUCT_ASINS = PRODUCT_CATALOG.map((p) => p.asin);

interface AmazonSourceOptions {
  apiKey?: string;
  timeoutMs?: number;
}

export class AmazonReviewSource implements ReviewSource {
  readonly name = "amazon";

  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(opts: AmazonSourceOptions = {}) {
    this.apiKey = (opts.apiKey ?? process.env.AMAZON_API_KEY ?? "").trim();
    this.timeoutMs = opts.timeoutMs ?? 10_000;
  }

  isEnabled(): boolean {
    return this.apiKey.length > 0;
  }

  async fetchReviews(options?: FetchOptions): Promise<RawReview[]> {
    if (!this.isEnabled()) {
      throw new Error(
        "AmazonReviewSource is disabled: set AMAZON_API_KEY to enable it.",
      );
    }

    // Scope to a single ASIN when asked (add-product flow); otherwise refresh
    // every catalog product.
    const asins = options?.asin ? [options.asin] : PRODUCT_ASINS;

    // Reference implementation for a real provider. Left unreachable in the
    // default setup because no key is committed. Shown to make the integration
    // seam concrete rather than hand-wavy.
    const all: RawReview[] = [];
    for (const asin of asins) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const url =
          `https://api.rainforestapi.com/request` +
          `?api_key=${encodeURIComponent(this.apiKey)}` +
          `&type=reviews&amazon_domain=amazon.in&asin=${asin}&sort_by=most_recent`;

        const res = await fetch(url, { signal: controller.signal });
        if (res.status === 429) {
          const err = new Error("amazon provider: rate limited (429)");
          (err as { status?: number }).status = 429;
          throw err;
        }
        if (!res.ok) {
          throw new Error(`amazon provider: HTTP ${res.status}`);
        }

        const json = (await res.json()) as {
          reviews?: Array<Record<string, unknown>>;
        };

        for (const r of json.reviews ?? []) {
          all.push({
            externalId: (r.id as string) ?? null,
            productName: (r.product_title as string) ?? null,
            rating: (r.rating as number) ?? null,
            title: (r.title as string) ?? null,
            body: (r.body as string) ?? null,
            author: (r.profile as { name?: string })?.name ?? null,
            // Rainforest returns e.g. "Reviewed in India on 3 July 2026" here;
            // normalize.parseCountry pulls the country name out of it.
            country: (r.date as { raw?: string })?.raw ?? null,
            date: (r.date as { raw?: string })?.raw ?? null,
          });
        }
      } finally {
        clearTimeout(timer);
      }
    }
    return all;
  }
}
