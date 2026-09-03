export type CityCardMarket = "de" | "ch";

const germanCityCardCopy = {
  "singles-berlin": "Entdecke neue Kontakte zwischen Kiezkultur, grünen Parks und vielseitigen Veranstaltungen – und finde Begegnungen, die zu deinem Leben passen.",
  "singles-bremen": "Lerne Singles ab 50 zwischen Weser, Altstadt und lebendigen Kulturorten kennen und entdecke entspannte Ideen für ein erstes Treffen.",
  "singles-dortmund": "Finde neue Kontakte zwischen Westfalenpark, Phoenix See und Dortmunder Kulturangeboten und plane ein Kennenlernen in angenehmer Atmosphäre.",
  "singles-dresden": "Entdecke Singles ab 50 zwischen Elbufer, historischer Altstadt und vielfältiger Kultur und finde schöne Anregungen für gemeinsame Unternehmungen.",
  "singles-duesseldorf": "Lerne Menschen ab 50 zwischen Rheinpromenade, Altstadt und grünen Rückzugsorten kennen und finde passende Ideen für ein entspanntes Treffen.",
  "singles-frankfurt-am-main": "Entdecke neue Kontakte zwischen Mainufer, Museumslandschaft und lebendigen Stadtvierteln und finde einen regionalen Einstieg in deine Partnersuche.",
  "singles-freiburg": "Lerne Singles ab 50 zwischen Altstadt, Schlossberg und der Natur des Breisgaus kennen und entdecke schöne Möglichkeiten für gemeinsame Erlebnisse.",
  "singles-hamburg": "Finde neue Kontakte zwischen Alster, Elbe und vielfältigen Kulturangeboten und entdecke Orte, an denen ein entspanntes Kennenlernen leichtfällt.",
  "singles-hannover": "Entdecke Singles ab 50 zwischen Maschsee, Eilenriede und lebendiger Kulturszene und finde Anregungen für gemeinsame Unternehmungen in deiner Nähe.",
  "singles-jena": "Lerne Menschen ab 50 zwischen Saale, grünen Höhen und Jenas Kulturangeboten kennen und finde passende Ideen für persönliche Begegnungen.",
  "singles-kassel": "Entdecke neue Kontakte zwischen Bergpark, Fuldaaue und vielseitigen Kulturorten und plane ein erstes Treffen in entspannter Umgebung.",
  "singles-koeln": "Finde Singles ab 50 zwischen Rhein, Veedeln und lebendiger Kulturszene und entdecke viele Möglichkeiten für persönliche Gespräche und gemeinsame Erlebnisse.",
  "singles-leipzig": "Lerne neue Menschen zwischen Seenlandschaft, Parks und Leipzigs vielseitiger Kultur kennen und finde passende Anregungen für ein entspanntes Treffen.",
  "singles-muenchen": "Entdecke Singles ab 50 zwischen Isar, Englischem Garten und Münchens Kulturangeboten und finde schöne Ideen für gemeinsame Unternehmungen.",
  "singles-nuernberg": "Finde neue Kontakte zwischen Altstadt, Pegnitzufer und vielfältigen Museen und entdecke angenehme Orte für ein persönliches Kennenlernen.",
  "rosenheim-singles": "Lerne Singles ab 50 zwischen historischer Innenstadt, Seen und Alpenvorland kennen und entdecke regionale Ideen für gemeinsame Erlebnisse.",
  "singles-stuttgart": "Entdecke Menschen ab 50 zwischen Schlossgarten, Weinbergen und Stuttgarts Kulturangeboten und finde passende Orte für neue Begegnungen.",
  "singles-suhl": "Finde neue Kontakte zwischen Thüringer Wald, Suhler Innenstadt und regionalen Freizeitangeboten und entdecke Anregungen für gemeinsame Unternehmungen.",
} as const;

const swissCityCardCopy = {
  zuerich: "Entdecke Singles ab 50 zwischen Zürichsee, Altstadt und vielseitiger Kulturszene und finde stilvolle Orte für persönliche Begegnungen.",
  genf: "Lerne neue Menschen zwischen Genfersee, Altstadt und internationalem Stadtleben kennen und entdecke schöne Ideen für ein entspanntes Treffen.",
  basel: "Finde Singles ab 50 zwischen Rhein, Altstadt und Basels reichem Kulturangebot und entdecke passende Anregungen für ein persönliches Kennenlernen.",
  bern: "Entdecke neue Kontakte zwischen Berner Altstadt, Aare und Rosengarten und finde angenehme Orte für gemeinsame Erlebnisse und gute Gespräche.",
  lausanne: "Lerne Singles ab 50 zwischen Ouchy, Genfersee und Lausannes lebendigen Quartieren kennen und finde schöne Ideen für neue Begegnungen.",
  winterthur: "Finde neue Kontakte zwischen Altstadt, Museen und grünen Erholungsorten und entdecke passende Möglichkeiten für gemeinsame Unternehmungen.",
  "st-gallen": "Entdecke Singles ab 50 zwischen Stiftsbezirk, Altstadt und Drei Weieren und finde stimmungsvolle Orte für persönliche Begegnungen.",
  lugano: "Lerne neue Menschen zwischen Luganersee, Parco Ciani und mediterraner Altstadt kennen und entdecke entspannte Ideen für ein erstes Treffen.",
  fribourg: "Finde Singles ab 50 zwischen mittelalterlicher Altstadt, Saane und zweisprachigem Stadtleben und entdecke schöne Anregungen für gemeinsame Zeit.",
  thun: "Entdecke neue Kontakte zwischen Thunersee, Aare und historischer Altstadt und finde besondere Orte für Gespräche und gemeinsame Unternehmungen.",
  koeniz: "Lerne Singles ab 50 zwischen Gurten, Schloss Köniz und naturnahen Ortsteilen kennen und finde passende Ideen für persönliche Begegnungen.",
  "biel-bienne": "Finde neue Kontakte zwischen Bielersee, zweisprachiger Altstadt und dem Seeland und entdecke vielseitige Möglichkeiten zum Kennenlernen.",
  schaffhausen: "Entdecke Singles ab 50 zwischen Rhein, Munot und historischer Altstadt und finde eindrucksvolle Orte für gemeinsame Erlebnisse.",
  "la-chaux-de-fonds": "Lerne neue Menschen zwischen Jugendstil, Uhrenkultur und Juralandschaft kennen und entdecke besondere Ideen für ein entspanntes Treffen.",
  luzern: "Finde Singles ab 50 zwischen Vierwaldstättersee, Altstadt und Bergpanorama und entdecke stimmungsvolle Orte für neue Begegnungen.",
  chur: "Entdecke neue Kontakte zwischen Churer Altstadt, Rhein und Bündner Bergwelt und finde passende Anregungen für gemeinsame Unternehmungen.",
  zug: "Lerne Singles ab 50 zwischen Zugersee, Altstadt und grüner Umgebung kennen und entdecke schöne Möglichkeiten für persönliche Gespräche.",
  aarau: "Finde neue Kontakte zwischen Aarauer Altstadt, Aare und regionalen Kulturangeboten und entdecke angenehme Ideen für gemeinsame Zeit.",
} as const;

const copyByMarket = {
  de: germanCityCardCopy,
  ch: swissCityCardCopy,
} as const;

export const germanCityCardSlugs = Object.keys(germanCityCardCopy);
export const swissCityCardSlugs = Object.keys(swissCityCardCopy);

export function cityCardCopy(market: CityCardMarket, slug: string): string {
  const copy = copyByMarket[market] as Record<string, string>;
  const value = copy[slug];
  if (!value) throw new Error(`Missing ${market.toUpperCase()} city-card copy for ${slug}`);
  return value;
}
