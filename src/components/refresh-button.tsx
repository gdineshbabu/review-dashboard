"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Triggers ingestion via POST /api/reviews/refresh, then refreshes the server
 * component so the newly-stored reviews appear. Surfaces a short status line so
 * the user gets honest feedback — including when the (flaky) upstream fails.
 */
export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    kind: "idle" | "ok" | "error";
    message: string;
  }>({ kind: "idle", message: "" });

  const busy = loading || isPending;

  async function handleRefresh() {
    setLoading(true);
    setStatus({ kind: "idle", message: "" });
    try {
      const res = await fetch("/api/reviews/refresh", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus({
          kind: "error",
          message: data.error ?? "Refresh failed. Please try again.",
        });
        return;
      }

      setStatus({
        kind: "ok",
        message:
          data.inserted > 0
            ? `Added ${data.inserted} new review${data.inserted === 1 ? "" : "s"}.`
            : "Up to date — no new reviews.",
      });
      // Re-render the server component to show any newly inserted rows.
      startTransition(() => router.refresh());
    } catch {
      setStatus({
        kind: "error",
        message: "Network error while refreshing.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleRefresh} disabled={busy}>
        <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
        {busy ? "Refreshing…" : "Refresh reviews"}
      </Button>
      {status.kind !== "idle" && (
        <span
          className={cn(
            "text-sm",
            status.kind === "ok"
              ? "text-[var(--color-muted-foreground)]"
              : "text-[var(--color-destructive)]",
          )}
        >
          {status.message}
        </span>
      )}
    </div>
  );
}
