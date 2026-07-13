import type { KnownProduct } from "@/models";

// -----------------------------------------------------------------------------
// Query / API
// -----------------------------------------------------------------------------
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** Sentinel used by the filter dropdowns to mean "no filter". */
export const ALL = "all";

// -----------------------------------------------------------------------------
// Product catalog
// -----------------------------------------------------------------------------
// ASINs resolved from the amzn.in short-links in TASK.md; productName is the
// value the fixtures/generator use so scoping a fetch by ASIN returns exactly
// that product's reviews.
export const PRODUCT_CATALOG: KnownProduct[] = [
  {
    asin: "B01A4W8AUK",
    productName: "KardiaMobile 1-Lead Personal EKG Monitor",
    label: "KardiaMobile 1-Lead",
    shortLink: "https://amzn.in/d/01qnlA6F",
  },
  {
    asin: "B07RQW6SD5",
    productName: "KardiaMobile 6L 6-Lead Personal EKG",
    label: "KardiaMobile 6L",
    shortLink: "https://amzn.in/d/07vKnqI2",
  },
  {
    asin: "B09TQ3ZN8V",
    productName: "KardiaMobile Card - Credit Card Sized EKG",
    label: "KardiaMobile Card",
    shortLink: "https://amzn.in/d/03eooMZA",
  },
];

// -----------------------------------------------------------------------------
// Synthetic data generation
// -----------------------------------------------------------------------------
export const DEFAULT_REVIEWS_PER_PRODUCT = 1000;

// Deterministic PRNG seeds per product so each stream is stable & reproducible.
export const PRODUCT_SEEDS: Record<string, number> = {
  B01A4W8AUK: 1_000_003,
  B07RQW6SD5: 2_000_003,
  B09TQ3ZN8V: 3_000_003,
};

// Fixed "now" so generated dates are reproducible and always older than the
// hand-written fixtures (which stay the newest reviews on the dashboard).
export const GENERATOR_BASE_ISO = "2026-06-09T00:00:00Z";

// Realistic positive skew for a well-reviewed medical device.
export const RATING_WEIGHTS: Array<{ rating: number; weight: number }> = [
  { rating: 5, weight: 46 },
  { rating: 4, weight: 26 },
  { rating: 3, weight: 12 },
  { rating: 2, weight: 7 },
  { rating: 1, weight: 9 },
];

// Reviewer countries, weighted toward India (amazon.in), with a long tail.
export const COUNTRY_WEIGHTS: Array<{ name: string; weight: number }> = [
  { name: "India", weight: 55 },
  { name: "United States", weight: 15 },
  { name: "United Kingdom", weight: 12 },
  { name: "Canada", weight: 6 },
  { name: "Australia", weight: 6 },
  { name: "Germany", weight: 3 },
  { name: "United Arab Emirates", weight: 3 },
];

export const FIRST_NAMES = [
  "Priya", "Arjun", "Rahul", "Aisha", "Meera", "Vikram", "Sanya", "Rohan",
  "Neha", "Karan", "Ananya", "Dev", "Fatima", "Imran", "Sofia", "Mark",
  "Grace", "William", "Helen", "Tom", "Nate", "Jordan", "Emily", "Owen",
  "Beatrice", "Sam", "Lena", "Arthur", "Carlos", "Devon", "Raj", "Aditya",
  "Kavya", "Manish", "Pooja", "Sunil", "Divya", "Harish", "Ritu", "Gaurav",
];
export const LAST_INITIALS = "ABCDEFGHIJKLMNPRSTVWY".split("");
