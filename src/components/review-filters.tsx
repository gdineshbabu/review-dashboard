"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

/**
 * Rating + source filters. Selecting a value updates the URL query string; the
 * server component re-reads searchParams and re-queries the API. Keeping filter
 * state in the URL means it's shareable and survives refreshes.
 */
export function ReviewFilters({ sources }: { sources: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRating = searchParams.get("rating") ?? ALL;
  const currentSource = searchParams.get("source") ?? ALL;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--color-muted-foreground)]">
          Rating
        </label>
        <Select
          value={currentRating}
          onValueChange={(v) => setParam("rating", v)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} star{n === 1 ? "" : "s"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sources.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-muted-foreground)]">
            Source
          </label>
          <Select
            value={currentSource}
            onValueChange={(v) => setParam("source", v)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All sources</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
