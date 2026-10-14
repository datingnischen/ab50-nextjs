import type { Metadata } from "next";

/**
 * Seitentitel so ausgeben, dass sie in Google nicht abgeschnitten werden (ca. 580 px bei 20px Arial; Seobility
 * misst genauso und meldete 39 Titel als „zu lang“). Die Layout-Vorlage hängt „ | ab50.de“ an. Passt der Titel
 * damit nicht mehr, entfällt der Zusatz; Titel, die schon „ab50“ enthalten, bekommen ihn nie (sonst doppelt).
 * Für Artikel, deren eigener Titel allein zu lang ist, gibt es kürzere SEO-Titel – die Überschrift bleibt.
 */
export const TITLE_SUFFIX = " | ab50.de";
/** Seobility misst rund 5 px mehr als die Canvas-Breite; 570 lässt den Puffer. */
export const TITLE_MAX_WIDTH = 570;

// Zeichenbreiten von Arial 20px (Canvas measureText), wie sie Google/Seobility für die Titelbreite ansetzen.
const ARIAL_20: Record<string, number> = {
  "0": 11.12, "1": 11.12, "2": 11.12, "3": 11.12, "4": 11.12, "5": 11.12, "6": 11.12, "7": 11.12, "8": 11.12, "9": 11.12,
  a: 11.12, b: 11.12, c: 10, d: 11.12, e: 11.12, f: 5.56, g: 11.12, h: 11.12, i: 4.44, j: 4.44, k: 10, l: 4.44, m: 16.66,
  n: 11.12, o: 11.12, p: 11.12, q: 11.12, r: 6.66, s: 10, t: 5.56, u: 11.12, v: 10, w: 14.44, x: 10, y: 10, z: 10,
  A: 13.34, B: 13.34, C: 14.44, D: 14.44, E: 13.34, F: 12.22, G: 15.56, H: 14.44, I: 5.56, J: 10, K: 13.34, L: 11.12,
  M: 16.66, N: 14.44, O: 15.56, P: 13.34, Q: 15.56, R: 14.44, S: 13.34, T: 12.22, U: 14.44, V: 13.34, W: 18.88, X: 13.34,
  Y: 13.34, Z: 12.22, ä: 11.12, ö: 11.12, ü: 11.12, Ä: 13.34, Ö: 15.56, Ü: 14.44, ß: 12.22, " ": 5.56, ".": 5.56, ",": 5.56,
  ":": 5.56, ";": 5.56, "!": 5.56, "?": 11.12, "-": 6.66, "–": 11.12, "—": 20, "|": 5.2, "&": 13.34, "(": 6.66, ")": 6.66,
  "/": 5.56, "’": 4.44, "„": 6.66, "“": 6.66, "”": 6.66, '"': 7.1, "'": 3.82, "+": 11.68, "%": 17.78, "#": 11.12, "*": 7.78,
};

export function titleWidth(title: string) {
  let width = 0;
  for (const char of title) width += ARIAL_20[char] ?? 11.12;
  return width;
}

/** Kürzere Titel (nur <title>) für Artikel, deren Überschrift allein über 570 px liegt. */
export const SEO_TITLES: Record<string, string> = {
  "dating-nach-verwitwung": "Dating nach Verwitwung: Trauer, Nähe, Intimität",
  "freundeskreis-dating-ab50": "Dating ab 50: Warum Freunde und Netzwerk helfen",
  "romance-scams-ab-50": "Romance-Scams ab 50: Fake-Profile erkennen",
  "haarausfall-dating-ab50": "Haartransplantation und Dating ab 50",
  "sprechpausen-beziehung": "Wenn Gespräche stocken: Pausen in der Beziehung",
  "blind-date-70-plus": "Blind Date mit 70 plus: Kennenlernen im Alter",
  "stilles-auseinanderleben-ab-50": "Stilles Auseinanderleben ab 50: Neuanfang wagen?",
  "sexualitaet-nach-menopause": "Sexualität nach der Menopause: Lust und Dating",
  "altersunterschied-beziehung-ab-50": "Altersunterschied in der Beziehung ab 50",
  "roboter-gegen-einsamkeit": "Roboter gegen Einsamkeit: Was Technik leisten kann",
  "reisen-singles-ab-50": "Reisen für Singles ab 50: Neue Begegnungen",
  "romance-scam": "Romance-Scam: Warum Singles ab 50 betroffen sind",
  "perfekte-dating-profil": "Das perfekte Dating-Profil ab 50 gestalten",
  "serioese-singleboerse": "Seriöse Singlebörse erkennen: Merkmale, die zählen",
  fliegen: "Fliegen ab 50: Neue Horizonte entdecken",
  "neuanfang-tod-des-partners-verkraften": "Tod des Partners verkraften: Neuanfang finden",
};

/** Liefert den Metadata-Titel: mit Vorlage, ohne Zusatz („absolute“) oder den kürzeren SEO-Titel. */
export function seoTitle(title: string, slug?: string): NonNullable<Metadata["title"]> {
  const text = (slug && SEO_TITLES[slug]) || title;
  if (/ab50\./i.test(text)) return { absolute: text };
  if (titleWidth(`${text}${TITLE_SUFFIX}`) <= TITLE_MAX_WIDTH) return text;
  return { absolute: text };
}
