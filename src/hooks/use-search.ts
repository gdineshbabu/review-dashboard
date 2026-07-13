"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Debounced free-text search bound to a URL query param (default `q`).
 *
 * Debounces typing and writes the value into the URL, so the server component
 * re-queries the API — the same URL-as-state pattern the filters use, which keeps
 * the search shareable and back/refresh friendly.
 */
export const useSearch = (paramKey = "q", delayMs = 300) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramKey) ?? "");

  // Keep local state in sync when the URL changes elsewhere (e.g. back button).
  useEffect(() => {
    setValue(searchParams.get(paramKey) ?? "");
  }, [searchParams, paramKey]);

  // Debounce URL updates so we don't re-query on every keystroke.
  useEffect(() => {
    const currentValue = searchParams.get(paramKey) ?? "";
    if (value === currentValue) return;

    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set(paramKey, trimmed);
      else params.delete(paramKey);
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/");
    }, delayMs);

    return () => clearTimeout(t);
  }, [value, router, searchParams, paramKey, delayMs]);

  return { value, setValue, clear: () => setValue("") };
};
