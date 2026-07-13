"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { useUrlFilters } from "@/hooks";
import { ALL } from "@/utils/constants";
import { RATING_VALUES } from "@/backend/constants";
import { FILTERS } from "@/utils/labels";
import type { ProductSummary } from "@/models";

/**
 * Product + rating + source + country filters. All state lives in the URL via
 * useUrlFilters, so filters are shareable and survive refreshes.
 */
export const ReviewFilters = ({
  sources,
  products,
  countries,
}: {
  sources: string[];
  products: ProductSummary[];
  countries: string[];
}) => {
  const { current, setParam } = useUrlFilters();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {products.length > 1 && (
        <FilterGroup label={FILTERS.product}>
          <Select
            value={current("product")}
            onValueChange={(v) => setParam("product", v)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{FILTERS.allProducts}</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.productName} value={p.productName}>
                  {p.productName} ({p.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>
      )}

      <FilterGroup label={FILTERS.rating}>
        <Select
          value={current("rating")}
          onValueChange={(v) => setParam("rating", v)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{FILTERS.allRatings}</SelectItem>
            {RATING_VALUES.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {FILTERS.star(n)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      {countries.length > 1 && (
        <FilterGroup label={FILTERS.country}>
          <Select
            value={current("country")}
            onValueChange={(v) => setParam("country", v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{FILTERS.allCountries}</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>
      )}

      {sources.length > 1 && (
        <FilterGroup label={FILTERS.source}>
          <Select
            value={current("source")}
            onValueChange={(v) => setParam("source", v)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{FILTERS.allSources}</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>
      )}
    </div>
  );
};

const FilterGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[var(--color-muted-foreground)]">
        {label}
      </label>
      {children}
    </div>
  );
};
