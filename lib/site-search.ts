// Seitensuche unter /ueber-uns/suche/. Bewusst ohne "@/"-Importe, damit node --test die Logik direkt prüfen kann.

export const SITE_SEARCH_PATH = "/ueber-uns/suche/";
export const SITE_SEARCH_MAX_RESULTS = 50;

export type SiteSearchDocument = {
  /** Bereich auf der Ergebniskarte, z. B. „Magazin“ oder „Stadt“. */
  area: string;
  title: string;
  excerpt: string;
  /** Voller Suchtext (Titel wird separat gewichtet). */
  text?: string;
  href: string;
  /** Vorschau-Pfad für Marktseiten auf *.vercel.app (siehe MarketLink). */
  previewHref?: string;
};

export type SiteSearchResult = SiteSearchDocument & { score: number };

/** Kleinschreibung, ä/ö/ü/ß ≙ ae/oe/ue/ss, übrige Diakritika weg, Satzzeichen zu Leerzeichen. */
export function normalizeSearchText(value: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function searchTerms(query: string): string[] {
  return Array.from(new Set(normalizeSearchText(query).split(" ").filter((term) => term.length > 0)));
}

export function shortExcerpt(value: string, maxLength = 180): string {
  const clean = (value || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "")} …`;
}

/**
 * Alle Suchbegriffe müssen vorkommen (Titel, Auszug oder Text). Titel-Treffer zählen deutlich mehr
 * als Auszug- oder Text-Treffer; ein Titel, der die ganze Anfrage enthält, steht ganz oben.
 */
export function searchDocuments(
  documents: SiteSearchDocument[],
  query: string,
  limit = SITE_SEARCH_MAX_RESULTS,
): SiteSearchResult[] {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  const phrase = terms.join(" ");
  const seen = new Set<string>();
  const results: SiteSearchResult[] = [];

  for (const document of documents) {
    if (seen.has(document.href)) continue;
    const title = normalizeSearchText(document.title);
    const excerpt = normalizeSearchText(document.excerpt);
    const text = normalizeSearchText(document.text || "");
    let score = 0;
    let allTermsFound = true;

    for (const term of terms) {
      if (title.includes(term)) {
        score += title.split(" ").includes(term) ? 120 : 100;
      } else if (excerpt.includes(term)) {
        score += 30;
      } else if (text.includes(term)) {
        score += 10;
      } else {
        allTermsFound = false;
        break;
      }
    }
    if (!allTermsFound) continue;
    if (title.includes(phrase)) score += 200;
    if (title.startsWith(phrase)) score += 50;

    seen.add(document.href);
    results.push({ ...document, score });
  }

  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "de"))
    .slice(0, limit);
}
