/**
 * All user-facing copy in one place. Keeping strings out of components makes the
 * wording easy to review/change and keeps the UI code focused on layout.
 */
export const APP = {
  title: "The Review Dash",
  subtitle: "AliveCor product reviews",
};

export const STATS = {
  total: "Total reviews",
  average: "Average rating",
  averageHint: "out of 5 stars",
  positive: "Positive (4–5★)",
  positiveHint: "of all reviews",
  sources: "Sources",
  ratingBreakdown: "Rating breakdown",
  updated: (date: string) => `updated ${date}`,
};

export const REVIEWS = {
  heading: "Latest reviews",
  subheading: "Showing the 20 most recent, newest first.",
  errorTitle: "Something went wrong",
  emptyFilteredTitle: "No reviews match these filters",
  emptyTitle: "No reviews yet",
  emptyFilteredHint: "Try clearing the rating or source filter.",
  emptyHint: 'Click "Refresh reviews" to pull the latest reviews into the dashboard.',
};

export const FILTERS = {
  product: "Product",
  allProducts: "All products",
  rating: "Rating",
  allRatings: "All ratings",
  star: (n: number) => `${n} star${n === 1 ? "" : "s"}`,
  source: "Source",
  allSources: "All sources",
  country: "Country",
  allCountries: "All countries",
};

export const SEARCH = {
  placeholder: "Search reviews by name or keyword…",
  ariaLabel: "Search reviews",
  clear: "Clear search",
};

export const REFRESH = {
  idle: "Refresh reviews",
  busy: "Refreshing…",
  upToDate: "Up to date — no new reviews.",
  failed: "Refresh failed. Please try again.",
  networkError: "Network error while refreshing.",
  added: (n: number) => `Added ${n} new review${n === 1 ? "" : "s"}.`,
};

export const ADD_PRODUCT = {
  title: "Add a product",
  description:
    "Paste an Amazon product link (or amzn.in share link) to pull its reviews into the dashboard.",
  placeholder: "https://amzn.in/d/…",
  idle: "Add product",
  busy: "Adding…",
  quickAdd: "Quick add:",
  failed: "Couldn't add that product.",
  networkError: "Network error while adding product.",
  added: (n: number, name: string) =>
    `Added ${n} new review${n === 1 ? "" : "s"} for ${name}.`,
  upToDate: (name: string) => `${name} is already up to date — no new reviews.`,
};

export const REVIEW_CARD = {
  anonymous: "Anonymous",
  unknownDate: "Unknown date",
};
