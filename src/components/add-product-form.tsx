"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface KnownProductChip {
  label: string;
  shortLink: string;
}

/**
 * Add a product's reviews to the dashboard by pasting an Amazon link.
 *
 * Posts the URL to POST /api/products, which resolves the link to an ASIN and
 * ingests that product (deduped). On success we refresh the server component so
 * the new reviews and the product filter update. The chips are one-click shortcuts
 * for the three KardiaMobile products from the assignment.
 */
export function AddProductForm({
  knownProducts,
}: {
  knownProducts: KnownProductChip[];
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    kind: "idle" | "ok" | "error";
    message: string;
  }>({ kind: "idle", message: "" });

  const busy = loading || isPending;

  async function addProduct(link: string) {
    const target = link.trim();
    if (!target || busy) return;

    setLoading(true);
    setStatus({ kind: "idle", message: "" });
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus({
          kind: "error",
          message: data.error ?? "Couldn't add that product.",
        });
        return;
      }

      const name = data.productName ?? "product";
      setStatus({
        kind: "ok",
        message:
          data.inserted > 0
            ? `Added ${data.inserted} new review${data.inserted === 1 ? "" : "s"} for ${name}.`
            : `${name} is already up to date — no new reviews.`,
      });
      setUrl("");
      startTransition(() => router.refresh());
    } catch {
      setStatus({ kind: "error", message: "Network error while adding product." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border bg-[var(--color-background)] p-4">
      <div>
        <h3 className="text-sm font-semibold">Add a product</h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Paste an Amazon product link (or amzn.in share link) to pull its reviews
          into the dashboard.
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
          placeholder="https://amzn.in/d/…"
          disabled={busy}
          className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:opacity-60"
        />
        <Button type="submit" disabled={busy || !url.trim()}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {busy ? "Adding…" : "Add product"}
        </Button>
      </form>

      {knownProducts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Quick add:
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
}
