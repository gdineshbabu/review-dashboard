"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { REFRESH } from "@/utils/labels";
import { IDLE_STATUS, type ActionStatus } from "./types";

/**
 * Triggers ingestion via POST /api/reviews/refresh, then refreshes the server
 * component so newly-stored reviews appear. Exposes a busy flag and a short
 * status line so the UI can give honest feedback — including when the (flaky)
 * upstream fails.
 */
export const useRefresh = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ActionStatus>(IDLE_STATUS);

  const busy = loading || isPending;

  const refresh = async () => {
    setLoading(true);
    setStatus(IDLE_STATUS);
    try {
      const res = await fetch("/api/reviews/refresh", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? REFRESH.failed });
        return;
      }

      setStatus({
        kind: "ok",
        message: data.inserted > 0 ? REFRESH.added(data.inserted) : REFRESH.upToDate,
      });
      startTransition(() => router.refresh());
    } catch {
      setStatus({ kind: "error", message: REFRESH.networkError });
    } finally {
      setLoading(false);
    }
  };

  return { refresh, busy, status };
};
