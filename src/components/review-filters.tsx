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

export interface ProductOption {
  productName: string;
  count: number;
}

/**
 * Product + rating + source filters. Selecting a value updates the URL query
 * string; the server component re-reads searchParams and re-queries the API.
 * Keeping filter state in the URL means it's shareable and survives refreshes.
 */
export function ReviewFilters({
  sources,
  products,
  countries,
}: {
  sources: string[];
  products: ProductOption[];
  countries: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRating = searchParams.get("rating") ?? ALL;
  const currentSource = searchParams.get("source") ?? ALL;
  const currentProduct = searchParams.get("product") ?? ALL;
  const currentCountry = searchParams.get("country") ?? ALL;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {products.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-muted-foreground)]">
            Product
          </label>
          <Select
            value={currentProduct}
            onValueChange={(v) => setParam("product", v)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.productName} value={p.productName}>
                  {p.productName} ({p.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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

      {countries.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-muted-foreground)]">
            Country
          </label>
          <Select
            value={currentCountry}
            onValueChange={(v) => setParam("country", v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
