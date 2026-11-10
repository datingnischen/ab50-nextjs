import type { Metadata } from "next";

/**
 * Metadaten für die gespiegelten deutschen Inhalte unter ab50.ch (Magazin, FAQ, Über uns, Suche).
 *
 * nginx reicht ab50.ch/magazin/…, /faq/ und /ueber-uns/… mit /ch-Präfix an Vercel weiter; die Seiten zeigen
 * dieselben deutschen Texte wie ab50.de. Ein Canonical auf ab50.de wertete Seobility auf ab50.ch als Fehler
 * („Externe Domain“, 98 Seiten, Struktur 0 %). Darum hier kein Canonical und keine hreflang-Paare, sondern
 * noindex, follow: Die Spiegelseite wird nicht als Dublette indexiert, ihre Links bleiben crawlbar.
 * Eigene Schweizer Inhalte (Partnersuche unter app/ch/partnersuche) behalten ihr Self-Canonical auf ab50.ch.
 */
export function mirrorMetadata(base: Metadata): Metadata {
  const openGraph = base.openGraph ? { ...base.openGraph, url: undefined } : undefined;
  return {
    ...base,
    alternates: { canonical: null, languages: {} },
    robots: { index: false, follow: true },
    ...(openGraph ? { openGraph } : {}),
  };
}
