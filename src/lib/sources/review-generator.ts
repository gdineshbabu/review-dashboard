import type { RawReview } from "./types";

/**
 * Deterministic synthetic review generator.
 *
 * Produces large, realistic-looking KardiaMobile review data WITHOUT scraping or
 * any paid API — so the dashboard can be populated with thousands of rows that
 * still run from a clean clone. Output is deterministic (seeded PRNG + fixed base
 * date) so a seed run is reproducible, and the field shapes stay deliberately
 * varied (stringy ratings, different body keys, mixed date formats, occasional
 * missing author/country) to keep exercising the normalization layer.
 *
 * This is clearly-labelled fake data, not real Amazon content.
 */

/** Small, fast, seedable PRNG (mulberry32) — deterministic per seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(rng: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)];

// Fixed "now" so generated dates are reproducible and always older than the
// hand-written fixtures (which stay the newest, curated reviews on the dashboard).
const BASE_MS = Date.parse("2026-06-09T00:00:00Z");
const DAY_MS = 86_400_000;

// Realistic positive skew for a well-reviewed medical device.
const RATING_WEIGHTS: Array<{ rating: number; weight: number }> = [
  { rating: 5, weight: 46 },
  { rating: 4, weight: 26 },
  { rating: 3, weight: 12 },
  { rating: 2, weight: 7 },
  { rating: 1, weight: 9 },
];

function weightedRating(rng: () => number): number {
  const total = RATING_WEIGHTS.reduce((s, r) => s + r.weight, 0);
  let roll = rng() * total;
  for (const { rating, weight } of RATING_WEIGHTS) {
    if (roll < weight) return rating;
    roll -= weight;
  }
  return 5;
}

// Reviewer countries, weighted toward India (amazon.in), with a long tail.
const COUNTRIES: Array<{ name: string; weight: number }> = [
  { name: "India", weight: 55 },
  { name: "United States", weight: 15 },
  { name: "United Kingdom", weight: 12 },
  { name: "Canada", weight: 6 },
  { name: "Australia", weight: 6 },
  { name: "Germany", weight: 3 },
  { name: "United Arab Emirates", weight: 3 },
];

function weightedCountry(rng: () => number): string {
  const total = COUNTRIES.reduce((s, c) => s + c.weight, 0);
  let roll = rng() * total;
  for (const { name, weight } of COUNTRIES) {
    if (roll < weight) return name;
    roll -= weight;
  }
  return "India";
}

const FIRST_NAMES = [
  "Priya", "Arjun", "Rahul", "Aisha", "Meera", "Vikram", "Sanya", "Rohan",
  "Neha", "Karan", "Ananya", "Dev", "Fatima", "Imran", "Sofia", "Mark",
  "Grace", "William", "Helen", "Tom", "Nate", "Jordan", "Emily", "Owen",
  "Beatrice", "Sam", "Lena", "Arthur", "Carlos", "Devon", "Raj", "Aditya",
  "Kavya", "Manish", "Pooja", "Sunil", "Divya", "Harish", "Ritu", "Gaurav",
];
const LAST_INITIALS = "ABCDEFGHIJKLMNPRSTVWY".split("");

function maybeAuthor(rng: () => number): string | null {
  const roll = rng();
  if (roll < 0.06) return null; // some reviews have no author
  if (roll < 0.1) return "Anonymous"; // normalizer maps this to null
  return `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_INITIALS)}.`;
}

// Sentiment-matched fragments. Bodies are assembled from an opener + a detail +
// a closer, which yields plenty of variety across a thousand rows per product.
const POSITIVE = {
  titles: [
    "Gave me real peace of mind", "Accurate and easy to use", "Worth every rupee",
    "Detected AFib my watch missed", "Doctor recommended and it delivers",
    "Best health purchase this year", "Fast, reliable readings", "Highly recommend",
    "A game changer for my heart health", "Simple setup, great results",
    "Exactly what I needed", "Impressed with the accuracy", "Portable and dependable",
  ],
  openers: [
    "I have occasional palpitations and this has been reassuring.",
    "My cardiologist suggested tracking my rhythm and this fits the bill.",
    "Setup took barely two minutes and it just works.",
    "Coming from a smartwatch, the readings here are far more trustworthy.",
    "Bought this after a scare and I'm so glad I did.",
  ],
  details: [
    "It caught an episode my routine checkups missed.",
    "The reading matched exactly what my doctor saw in the clinic.",
    "Being able to email a PDF of my EKG before an appointment is fantastic.",
    "30 seconds and I have a medical-grade result.",
    "The app history makes it easy to spot patterns over time.",
  ],
  closers: [
    "Would recommend to anyone monitoring their heart.",
    "No regrets at all.",
    "It has become part of my daily routine.",
    "Peace of mind you can't put a price on.",
    "Five stars from me.",
  ],
};
const NEUTRAL = {
  titles: [
    "Works well, minor niggles", "Good but subscription is pushy", "Does the job",
    "Solid, with a learning curve", "Decent, could be better", "Fine for the price",
    "Useful once you get the hang of it", "Reliable but app is clunky",
  ],
  openers: [
    "It does what it says, no more no less.",
    "Overall a useful device with a couple of caveats.",
    "Took a little practice to get consistent readings.",
    "The hardware is good; the software could use polish.",
  ],
  details: [
    "The app constantly nudges you toward the premium plan.",
    "Placement of the fingers matters more than I expected.",
    "Occasionally I get an 'unclassified' result and have to retry.",
    "Battery lasts ages, which is a plus.",
  ],
  closers: [
    "Happy enough with it.",
    "Would still recommend with those caveats.",
    "Meets my basic needs.",
    "Three stars feels fair.",
  ],
};
const NEGATIVE = {
  titles: [
    "Struggled to get a clean reading", "Stopped connecting after an update",
    "Disappointing for the price", "Battery compartment failed", "Not for me",
    "Reading quality below expectations", "Support was unhelpful", "Kept disconnecting",
  ],
  openers: [
    "I wanted to love this but ran into problems.",
    "Worked for a while then started acting up.",
    "Unfortunately my experience has been frustrating.",
    "Had high hopes but it let me down.",
  ],
  details: [
    "Half my readings come back 'unclassified'.",
    "A phone update broke the Bluetooth pairing entirely.",
    "The battery cover cracked within weeks.",
    "Pairing takes several tries every single time.",
  ],
  closers: [
    "Expected better at this price.",
    "Can't recommend it as it stands.",
    "Hope a firmware fix addresses this.",
    "Two stars until it's sorted.",
  ],
};

function poolFor(rating: number) {
  if (rating >= 4) return POSITIVE;
  if (rating === 3) return NEUTRAL;
  return NEGATIVE;
}

function buildBody(rng: () => number, rating: number): string {
  const pool = poolFor(rating);
  return `${pick(rng, pool.openers)} ${pick(rng, pool.details)} ${pick(rng, pool.closers)}`;
}

function buildTitle(rng: () => number, rating: number): string | null {
  // A few reviews have no title.
  if (rng() < 0.08) return null;
  return pick(rng, poolFor(rating).titles);
}

/** Format a Date into one of several messy upstream shapes. */
function formatDate(rng: () => number, ms: number): Partial<RawReview> {
  const roll = rng();
  if (roll < 0.6) return { date: new Date(ms).toISOString() };
  if (roll < 0.85) {
    // human-ish "3 July 2026" style; Date can parse it back.
    const human = new Date(ms).toUTCString().slice(5, 16).trim();
    return { reviewedAt: human };
  }
  return { date: ms }; // unix ms timestamp
}

export interface GeneratableProduct {
  asin: string;
  productName: string;
}

/**
 * Generate `count` synthetic reviews for a single product. `seedBase` keeps each
 * product's stream independent yet reproducible.
 */
export function generateProductReviews(
  product: GeneratableProduct,
  count: number,
  seedBase: number,
): RawReview[] {
  const out: RawReview[] = [];
  for (let i = 0; i < count; i++) {
    const rng = mulberry32(seedBase + i * 2654435761);
    const rating = weightedRating(rng);
    const body = buildBody(rng, rating);
    const title = buildTitle(rng, rating);
    const author = maybeAuthor(rng);
    const country = rng() < 0.12 ? null : weightedCountry(rng);
    const ageDays = Math.floor(rng() * 720); // up to ~2 years back
    const ms = BASE_MS - ageDays * DAY_MS - Math.floor(rng() * DAY_MS);

    // Vary which key the body arrives under, like a real messy upstream.
    const bodyKeyRoll = rng();
    const bodyField: Partial<RawReview> =
      bodyKeyRoll < 0.6
        ? { body }
        : bodyKeyRoll < 0.85
          ? { text: body }
          : { content: body };

    // Vary rating as number vs numeric string.
    const ratingField = rng() < 0.5 ? rating : String(rating);

    // Country sometimes arrives as an Amazon "Reviewed in X on …" blob.
    const countryField: Partial<RawReview> =
      country === null
        ? {}
        : rng() < 0.2
          ? { location: `Reviewed in ${country} on ${new Date(ms).toUTCString().slice(5, 16).trim()}` }
          : { country };

    out.push({
      externalId: `gen-${product.asin}-${i + 1}`,
      productName: product.productName,
      rating: ratingField,
      title,
      author,
      ...bodyField,
      ...countryField,
      ...formatDate(rng, ms),
    });
  }
  return out;
}
