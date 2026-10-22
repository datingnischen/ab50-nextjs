/**
 * Meta-Descriptions auf die in Suchergebnissen sichtbare Länge kürzen (Google schneidet bei ca. 1.000 px bzw.
 * 155–160 Zeichen ab; Seobility meldete 25 Seiten als „zu lang“). Gekürzt wird bevorzugt am Satzende, sonst am
 * Wortende mit Auslassungszeichen. Der sichtbare Seitentext bleibt unverändert.
 */
export const META_DESCRIPTION_MAX = 150;
const MIN_SENTENCE_LENGTH = 90;

export function clampMetaDescription(text?: string | null, max = META_DESCRIPTION_MAX): string {
  if (!text) return "";
  const normalized = String(text)
    .replace(/\s+/g, " ")
    .replace(/^Artikel kurz anhören\s+Die wichtigsten Punkte kurz und verständlich zusammengefasst\.\s*(?:Dein Browser unterstützt das Audio-Element nicht\.\s*)?/i, "")
    .replace(/\s*(?:\[(?:…|\.\.\.)\]|\.\.\.|…)\s*$/, "")
    .trim();
  if (normalized.length <= max) return normalized;

  const window = normalized.slice(0, max);
  let sentenceEnd = -1;
  for (const match of window.matchAll(/[.!?](?=\s|$)/g)) sentenceEnd = match.index ?? sentenceEnd;
  if (sentenceEnd + 1 >= MIN_SENTENCE_LENGTH) return window.slice(0, sentenceEnd + 1);

  const cut = window.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const words = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–—-]+$/, "");
  return `${words} …`;
}

/**
 * Feste Magazinseiten, deren Seitentext keinen brauchbaren Anfang hat: Die Rätselseiten beginnen mit dem
 * Ersatztext des Rätsel-iframes („Ihr Browser kann leider …“) und hatten dadurch dieselbe Description.
 */
export const PAGE_META_DESCRIPTIONS: Record<string, string> = {
  "sudoku-online": "Sudoku online und kostenlos im Browser spielen, dazu Regeln, Tipps für Einsteiger, Varianten und die Geschichte des beliebten Zahlenrätsels.",
  "online-kreuzwortraetsel": "Kreuzworträtsel online und kostenlos im Browser lösen, dazu Definition, Spielarten wie das Schwedenrätsel und praktische Tipps zum Lösen.",
};

/** Artikel, deren Anfang als Description zu kurz ausfällt (unter 110 Zeichen). */
export const POST_META_DESCRIPTIONS: Record<string, string> = {
  "online-dating": "Online-Dating ab 50: wie Sie die passende Plattform wählen, ein ansprechendes Profil erstellen, ins Gespräch kommen und das erste Treffen planen.",
};

/** Description einer festen Seite: eigener Text, sonst der Seitenanfang ohne iframe-Ersatztext. */
export function pageMetaDescription(slug: string, text?: string | null): string {
  if (PAGE_META_DESCRIPTIONS[slug]) return PAGE_META_DESCRIPTIONS[slug];
  return clampMetaDescription(String(text || "").replace(/Ihr Browser kann leider keine eingebetteten Frames anzeigen:.*?aufrufen:\s*\S+\s*/s, ""));
}
