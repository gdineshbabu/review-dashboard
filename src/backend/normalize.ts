import { createHash } from "crypto";
import type { NormalizedReview, RawReview } from "@/models";

/** Coerce a possibly-stringy, possibly-missing rating into 1..5, or null. */
const parseRating = (raw: RawReview["rating"]): number | null => {
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n)) return null;
  if (n < 1 || n > 5) return null;
  return Math.round(n);
};

/** The body can arrive under several keys; take the first non-empty one. */
const parseBody = (raw: RawReview): string | null => {
  const candidate = raw.body ?? raw.text ?? raw.content;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : null;
};

/**
 * Coerce a possibly-messy country value into a clean name, or null.
 * Handles Amazon-style "Reviewed in the United States on 3 July 2026" blobs by
 * pulling out the country between "Reviewed in" and "on".
 */
const parseCountry = (raw: RawReview): string | null => {
  const value = raw.country ?? raw.location;
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const match = /reviewed in\s+(.+?)(?:\s+on\b.*)?$/i.exec(trimmed);
  const name = (match ? match[1] : trimmed).replace(/^the\s+/i, "").trim();
  return name || null;
};

/** Parse the many date shapes an upstream might send. Returns null if unusable. */
const parseDate = (raw: RawReview): Date | null => {
  const value = raw.reviewedAt ?? raw.date;
  if (value === null || value === undefined) return null;

  // Unix epoch (ms) as number or numeric string.
  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  const asNumber = Number(value);
  if (value.trim() !== "" && Number.isFinite(asNumber) && /^\d+$/.test(value.trim())) {
    const d = new Date(asNumber);
    return isNaN(d.getTime()) ? null : d;
  }

  // ISO strings and human-readable dates ("July 3, 2026").
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Derive a stable id when the source doesn't provide one, by hashing the fields
 * that identify a review. This is what makes ingestion idempotent for sources
 * that lack their own ids: the same review always hashes to the same externalId,
 * so the unique (source, externalId) constraint dedupes it.
 */
const deriveExternalId = (
  source: string,
  productName: string,
  author: string | null,
  body: string,
): string => {
  const hash = createHash("sha1");
  hash.update(`${source}::${productName}::${author ?? ""}::${body}`);
  return `sha1:${hash.digest("hex").slice(0, 20)}`;
};

/**
 * Turn one raw review into a validated NormalizedReview, or return null if it's
 * too broken to keep (no usable rating, body, or date). Dropping unusable rows
 * rather than throwing keeps a single bad record from failing the whole batch.
 */
export const normalizeReview = (
  source: string,
  raw: RawReview,
): NormalizedReview | null => {
  const rating = parseRating(raw.rating);
  const body = parseBody(raw);
  const reviewedAt = parseDate(raw);
  const productName = raw.productName?.trim();

  if (rating === null || !body || !reviewedAt || !productName) {
    return null;
  }

  const title = raw.title?.trim() || null;
  const author = raw.author?.trim() || null;
  // Treat placeholder authors as anonymous.
  const cleanAuthor =
    author && author.toLowerCase() !== "anonymous" ? author : null;
  const country = parseCountry(raw);

  const externalId =
    raw.externalId?.trim() ||
    deriveExternalId(source, productName, cleanAuthor, body);

  return {
    source,
    externalId,
    productName,
    rating,
    title,
    body,
    author: cleanAuthor,
    country,
    reviewedAt,
  };
};

/** Normalize a batch, discarding unusable rows. Reports how many were dropped. */
export const normalizeBatch = (
  source: string,
  raws: RawReview[],
): { valid: NormalizedReview[]; dropped: number } => {
  const valid: NormalizedReview[] = [];
  let dropped = 0;
  for (const raw of raws) {
    const n = normalizeReview(source, raw);
    if (n) valid.push(n);
    else dropped++;
  }
  return { valid, dropped };
};
