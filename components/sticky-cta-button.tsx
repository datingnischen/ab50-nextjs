"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { marketFromLocation, registrationUrl } from "@/lib/markets";

function aidFromPathname(pathname: string) {
  return pathname.includes("/partnersuche") ? "location" as const : "magazin" as const;
}

export function StickyCTAButton() {
  const pathname = usePathname();
  const market = marketFromLocation(pathname, typeof window === "undefined" ? undefined : window.location.hostname);
  const [ctaText, setCtaText] = useState("Kostenlos registrieren");
  const [ctaUrl, setCtaUrl] = useState(registrationUrl(market, aidFromPathname(pathname)));

  useEffect(() => {
    const aid = aidFromPathname(pathname);
    const fallback = registrationUrl(market, aid);
    setCtaUrl(fallback);
    setCtaText("Kostenlos registrieren");

    if (market !== "de") return;

    let endpoint = "";
    let slug = "";
    const partnersucheMatch = pathname.match(/\/partnersuche\/([^/]+)/);
    const magazinMatch = pathname.match(/\/magazin\/([^/]+)/);
    if (partnersucheMatch) {
      endpoint = "stadt";
      slug = partnersucheMatch[1];
    } else if (magazinMatch) {
      endpoint = "posts";
      slug = magazinMatch[1];
    }
    if (!endpoint || !slug) return;

    const controller = new AbortController();
    fetch(`https://ab50.de/magazin/wp-json/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&_fields=id,acf`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : [])
      .then((records) => {
        const label = Array.isArray(records) ? records[0]?.acf?.footer_cta_button_text : null;
        if (label) setCtaText(label);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") console.error("Error fetching CTA text:", error);
      });

    return () => controller.abort();
  }, [market, pathname]);

  return (
    <a href={ctaUrl} className="sticky-cta-button" aria-label={ctaText}>
      <span className="sticky-cta-text">{ctaText}</span>
      <span className="sticky-cta-icon" aria-hidden="true">→</span>
    </a>
  );
}
