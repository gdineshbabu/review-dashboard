"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ALL } from "@/utils/constants";

/**
 * Reads/writes filter state in the URL query string. Selecting a value pushes a
 * new URL; the server component re-reads searchParams and re-queries the API.
 * Keeping filter state in the URL makes it shareable and refresh-proof.
 */
export const useUrlFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  /** Current value of a filter param, defaulting to the "all" sentinel. */
  const current = (key: string): string => searchParams.get(key) ?? ALL;

  /** Set (or clear, when value === ALL) a single filter param. */
  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  return { current, setParam };
};
