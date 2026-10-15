/**
 * Öffentliche Stadt-Slugs mit Umlaut. ICONY (partner_sitemap.php, Startseite) führt München und Düsseldorf unter
 * /partnersuche/singles-münchen/ bzw. singles-düsseldorf/, die Daten liegen unter dem ASCII-Slug. Beide Adressen
 * lieferten dieselbe Seite mit eigenem Canonical (Seobility 2026-10-15: Duplicate Content). Öffentlich gilt nur die
 * Umlaut-Adresse; die ASCII-Variante leitet per 308 dorthin um (next.config.mjs).
 */
export const PUBLIC_CITY_SLUGS: Readonly<Record<string, string>> = Object.freeze({
  "singles-muenchen": "singles-münchen",
  "singles-duesseldorf": "singles-düsseldorf",
});

export function publicCitySlug(slug: string) {
  return PUBLIC_CITY_SLUGS[slug] ?? slug;
}
