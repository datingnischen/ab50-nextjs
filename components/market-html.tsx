"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { marketPreviewPath, type MarketCode } from "@/lib/markets";

function isPreviewHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app");
}

export function MarketHtml({ html, market }: { html: string; market: MarketCode }) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (
      event.button !== 0
      || event.defaultPrevented
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || !isPreviewHost(window.location.hostname)
    ) return;

    const target = event.target as HTMLElement | null;
    const anchor = target?.closest("a");
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const rawHref = anchor.getAttribute("href") || "";
    if (!rawHref.startsWith("/") || rawHref.startsWith("//") || /^\/(?:de|ch)(?:\/|[?#]|$)/.test(rawHref)) return;

    event.preventDefault();
    router.push(marketPreviewPath(market, rawHref));
  }

  return <div className="article-content" onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
