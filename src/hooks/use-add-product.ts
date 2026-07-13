"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ADD_PRODUCT } from "@/utils/labels";
import { IDLE_STATUS, type ActionStatus } from "./types";

/**
 * Adds a product's reviews by posting an Amazon link to POST /api/products.
 * Manages the input value, a busy flag, and a status line; refreshes the server
 * component on success so the new reviews and product filter update.
 */
export const useAddProduct = () => {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ActionStatus>(IDLE_STATUS);

  const busy = loading || isPending;

  const addProduct = async (link: string) => {
    const target = link.trim();
    if (!target || busy) return;

    setLoading(true);
    setStatus(IDLE_STATUS);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? ADD_PRODUCT.failed });
        return;
      }

      const name = data.productName ?? "product";
      setStatus({
        kind: "ok",
        message:
          data.inserted > 0
            ? ADD_PRODUCT.added(data.inserted, name)
            : ADD_PRODUCT.upToDate(name),
      });
      setUrl("");
      startTransition(() => router.refresh());
    } catch {
      setStatus({ kind: "error", message: ADD_PRODUCT.networkError });
    } finally {
      setLoading(false);
    }
  };

  return { url, setUrl, addProduct, busy, status };
};
