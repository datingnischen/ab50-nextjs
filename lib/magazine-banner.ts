export type MagazineBanner = { topic: string; image: "mann" | "frau"; title: string; text: string };

const banners: Record<string, MagazineBanner> = {
  neustart: { topic: "neustart", image: "mann", title: "Bereit für einen Neustart?", text: "Neue Begegnungen dürfen in deinem Tempo beginnen. Lerne auf ab50.de Singles kennen, die ebenfalls offen für Neues sind." },
  naehe: { topic: "naehe", image: "frau", title: "Raum für neue Nähe", text: "Gute Gespräche können der Anfang sein. Entdecke auf ab50.de Menschen, mit denen du gemeinsame Interessen teilen kannst." },
  vertrauen: { topic: "vertrauen", image: "frau", title: "In Ruhe kennenlernen", text: "Du entscheidest, wem du schreibst und wann du mehr von dir zeigst. Starte mit einem kostenlosen Profil auf ab50.de." },
  kennenlernen: { topic: "kennenlernen", image: "mann", title: "Neue Menschen kennenlernen", text: "Starte kostenlos auf ab50.de und lerne Singles in deinem Tempo kennen." },
  frauen: { topic: "naehe", image: "frau", title: "Neue Begegnungen, ganz in deinem Tempo", text: "Du musst dich nicht verstellen. Starte kostenlos auf ab50.de und lerne neue Menschen kennen." },
  maenner: { topic: "kennenlernen", image: "mann", title: "Zeig dich so, wie du bist", text: "Ein gutes Gespräch beginnt mit einem ersten Schritt. Lege auf ab50.de kostenlos dein Profil an." },
};

/** Specific article subjects win over broad categories; unknown topics use a neutral fallback. */
export function bannerForArticle(slug: string, categories: string[]): MagazineBanner {
  if (/menopause|wechseljahre|frauen/.test(slug)) return banners.frauen;
  if (/haarausfall|maenner/.test(slug)) return banners.maenner;
  if (/neustart|neuanfang|wieder-daten|verwitw|neue-liebe-nach|trennung/.test(slug)) return banners.neustart;
  if (categories.includes("sicherheit-vertrauen")) return banners.vertrauen;
  if (categories.includes("leben")) return banners.neustart;
  if (categories.includes("beziehung-naehe")) return banners.naehe;
  return banners.kennenlernen;
}
