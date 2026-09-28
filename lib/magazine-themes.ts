/** Themenwelten des 50plus Magazins: Farbe und Symbol je WordPress-Kategorie (Slug). */
export type ThemeIcon = "heart" | "users" | "phone" | "chat" | "shield" | "compass" | "spark";

export type MagazineTheme = { slug: string; short: string; icon: ThemeIcon; tone: string };

export const MAGAZINE_THEMES: Record<string, MagazineTheme> = {
  "online-dating-ab-50": { slug: "online-dating-ab-50", short: "Online-Dating", icon: "phone", tone: "blue" },
  "beziehung-naehe": { slug: "beziehung-naehe", short: "Beziehung & Nähe", icon: "heart", tone: "red" },
  leben: { slug: "leben", short: "Neuanfang ab 50", icon: "spark", tone: "gold" },
  "sicherheit-vertrauen": { slug: "sicherheit-vertrauen", short: "Sicherheit", icon: "shield", tone: "green" },
  "profil-kommunikation": { slug: "profil-kommunikation", short: "Profil & Kommunikation", icon: "chat", tone: "plum" },
  "freizeit-aktiv-bleiben": { slug: "freizeit-aktiv-bleiben", short: "Freizeit & Aktiv", icon: "users", tone: "green" },
  "singleboersen-vergleiche": { slug: "singleboersen-vergleiche", short: "Singlebörsen", icon: "compass", tone: "blue" },
};

export function themeFor(slug?: string | null): MagazineTheme {
  return (slug && MAGAZINE_THEMES[slug]) || { slug: slug || "", short: "Magazin", icon: "heart", tone: "red" };
}

export function plainText(html?: string | null) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8230;|&hellip;/g, "…")
    .replace(/&#8222;|&bdquo;/g, "„")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

/** Auszug ohne Audio-Player-Hinweis und ohne „[…]“. */
export function excerptText(html?: string | null, max = 170) {
  const text = plainText(html)
    .replace(/^Artikel kurz anhören[\s\S]*?Audio-Element nicht\.?\s*/i, "")
    .replace(/\s*\[(?:…|\.\.\.)\]\s*$/, "");
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}
