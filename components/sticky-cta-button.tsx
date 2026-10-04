"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ctaTexts from "@/data/wp/cta-texts.json";
import { marketFromLocation, registrationUrl } from "@/lib/markets";

function aidFromPathname(pathname: string) {
  return pathname.includes("/partnersuche") ? "location" as const : "magazin" as const;
}

export function StickyCTAButton() {
  const pathname = usePathname();
  const market = marketFromLocation(pathname, typeof window === "undefined" ? undefined : window.location.hostname);
  const [ctaText, setCtaText] = useState("Kostenlos registrieren");
  const [ctaUrl, setCtaUrl] = useState(registrationUrl(market, aidFromPathname(pathname)));
  const [visible, setVisible] = useState(false);

  // Erst nach 520px Scrollweg einblenden (nur mobil sichtbar, siehe CSS)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const aid = aidFromPathname(pathname);
    const fallback = registrationUrl(market, aid);
    setCtaUrl(fallback);
    setCtaText("Kostenlos registrieren");

    if (market !== "de") return;

    const partnersucheMatch = pathname.match(/\/partnersuche\/([^/]+)/);
    const magazinMatch = pathname.match(/\/magazin\/([^/]+)/);
    const label = partnersucheMatch
      ? (ctaTexts.stadt as Record<string, string>)[partnersucheMatch[1]]
      : magazinMatch
        ? (ctaTexts.posts as Record<string, string>)[magazinMatch[1]]
        : null;
    if (label) setCtaText(label);
  }, [market, pathname]);

  return (
    <a href={ctaUrl} className={`sticky-cta-button${visible ? " sticky-cta-visible" : ""}`} aria-label={ctaText} aria-hidden={!visible} tabIndex={visible ? 0 : -1}>
      <span className="sticky-cta-text">{ctaText}</span>
      <span className="sticky-cta-icon" aria-hidden="true">→</span>
    </a>
  );
}
