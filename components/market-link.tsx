"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

function isPreviewHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app");
}

function shouldUsePreviewRoute(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0
    && !event.defaultPrevented
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
    && !event.currentTarget.hasAttribute("download")
    && (!event.currentTarget.target || event.currentTarget.target === "_self")
    && isPreviewHost(window.location.hostname);
}

export function MarketLink({
  href,
  previewHref,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  previewHref: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const router = useRouter();

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={(event) => {
        if (!shouldUsePreviewRoute(event)) return;
        event.preventDefault();
        router.push(previewHref);
      }}
    >
      {children}
    </a>
  );
}
