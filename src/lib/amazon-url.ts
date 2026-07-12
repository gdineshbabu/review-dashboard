/**
 * Turn a user-pasted Amazon URL into an ASIN.
 *
 * Handles the two shapes people actually paste:
 *   - full product URLs: https://www.amazon.in/dp/B01A4W8AUK, /gp/product/…, etc.
 *   - shortened share links: https://amzn.in/d/01qnlA6F  (a redirect we follow)
 *
 * An Amazon ASIN is a 10-character alphanumeric code. We only accept links whose
 * host is amazon.* or amzn.*, so a random URL is rejected up front.
 */

const ASIN_RE = /(?:\/dp\/|\/gp\/product\/|\/product\/|\/dp\/product\/)([A-Z0-9]{10})/i;

function isAmazonHost(host: string): boolean {
  return /(^|\.)amazon\.[a-z.]+$/i.test(host) || /(^|\.)amzn\.[a-z.]+$/i.test(host);
}

/** Extract an ASIN from an already-canonical Amazon URL, or null. */
export function extractAsin(url: string): string | null {
  const match = ASIN_RE.exec(url);
  return match ? match[1].toUpperCase() : null;
}

export interface ResolvedProduct {
  asin: string;
  /** The canonical URL we resolved to (after following any redirect). */
  canonicalUrl: string;
}

/**
 * Resolve an input string to an ASIN. Short-links (amzn.in/d/…) carry no ASIN in
 * the path, so we follow the redirect to read the real product URL. Network is
 * only touched for short-links; full URLs are parsed locally.
 *
 * Returns null when the input isn't a usable Amazon product link (bad host,
 * no ASIN, or the redirect couldn't be followed).
 */
export async function resolveAmazonUrl(
  input: string,
  timeoutMs = 8000,
): Promise<ResolvedProduct | null> {
  const trimmed = input.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (!isAmazonHost(parsed.hostname)) return null;

  // Full product URL — the ASIN is already in the path.
  const direct = extractAsin(parsed.href);
  if (direct) return { asin: direct, canonicalUrl: parsed.href };

  // Short-link (amzn.in/d/…): follow the redirect to reach the product page.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(parsed.href, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (review-dash)" },
    });
    const asin = extractAsin(res.url);
    return asin ? { asin, canonicalUrl: res.url } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
