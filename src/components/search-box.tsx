"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Free-text search over reviews (author name, title, body, product).
 *
 * Debounces typing and writes the query into the `q` URL param, so the server
 * component re-queries the API — the same URL-as-state pattern the filters use,
 * which keeps the search shareable and back/refresh friendly.
 */
export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);

  // Keep local state in sync when the URL changes elsewhere (e.g. back button).
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Debounce URL updates so we don't re-query on every keystroke.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (value === current) return;

    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/");
    }, 300);

    return () => clearTimeout(t);
  }, [value, router, searchParams]);

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search reviews by name or keyword…"
        aria-label="Search reviews"
        className="w-full rounded-md border bg-transparent py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
