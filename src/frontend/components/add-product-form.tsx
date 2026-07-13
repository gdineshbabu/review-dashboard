"use client";

import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { useAddProduct } from "@/hooks";
import { cn } from "@/utils";
import { ADD_PRODUCT } from "@/utils/labels";

export interface KnownProductChip {
  label: string;
  shortLink: string;
}

/**
 * Add a product's reviews to the dashboard by pasting an Amazon link. All logic
 * lives in the useAddProduct hook; the chips are one-click shortcuts for the
 * KardiaMobile products from the assignment.
 */
export const AddProductForm = ({
  knownProducts,
}: {
  knownProducts: KnownProductChip[];
}) => {
  const { url, setUrl, addProduct, busy, status } = useAddProduct();

  return (
    <div className="space-y-3 rounded-lg border bg-[var(--color-background)] p-4">
      <div>
        <h3 className="text-sm font-semibold">{ADD_PRODUCT.title}</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {ADD_PRODUCT.description}
        </p>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          addProduct(url);
        }}
      >
        <input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={ADD_PRODUCT.placeholder}
          disabled={busy}
          className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:opacity-60"
        />
        <Button type="submit" disabled={busy || !url.trim()}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {busy ? ADD_PRODUCT.busy : ADD_PRODUCT.idle}
        </Button>
      </form>

      {knownProducts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {ADD_PRODUCT.quickAdd}
          </span>
          {knownProducts.map((p) => (
            <button
              key={p.shortLink}
              type="button"
              disabled={busy}
              onClick={() => addProduct(p.shortLink)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-[var(--color-muted)] disabled:opacity-60"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {status.kind !== "idle" && (
        <p
          className={cn(
            "text-sm",
            status.kind === "ok"
              ? "text-[var(--color-muted-foreground)]"
              : "text-[var(--color-destructive)]",
          )}
        >
          {status.message}
        </p>
      )}
    </div>
  );
};
