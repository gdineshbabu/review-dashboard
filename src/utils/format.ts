/**
 * Format an ISO date as e.g. "8 Jul 2026". Returns `fallback` for null/invalid
 * input so callers never render "Invalid Date".
 */
export const formatDate = (iso: string | null, fallback = "—"): string => {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
