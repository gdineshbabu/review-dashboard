"use client";

import { Search, X } from "lucide-react";
import { useSearch } from "@/hooks";
import { SEARCH } from "@/utils/labels";

/** Free-text search over reviews (author name, title, body, product). */
export const SearchBox = () => {
  const { value, setValue, clear } = useSearch();

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={SEARCH.placeholder}
        aria-label={SEARCH.ariaLabel}
        className="w-full rounded-md border bg-transparent py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
      />
      {value && (
        <button
          type="button"
          aria-label={SEARCH.clear}
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
