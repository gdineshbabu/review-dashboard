"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { useRefresh } from "@/hooks";
import { cn } from "@/utils";
import { REFRESH } from "@/utils/labels";

/**
 * Runs ingestion and surfaces a short status line. All logic lives in the
 * useRefresh hook; this component is just the button + feedback.
 */
export const RefreshButton = () => {
  const { refresh, busy, status } = useRefresh();

  return (
    <div className="flex items-center gap-3">
      <Button onClick={refresh} disabled={busy}>
        <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
        {busy ? REFRESH.busy : REFRESH.idle}
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
};
