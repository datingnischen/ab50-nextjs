/**
 * Stadtfakten für die Schweizer Stadtseiten.
 *
 * Quelle aller Einwohner-, Quartiers- und Treffpunktangaben sind die bereits
 * veröffentlichten Stadttexte in `data/ch-partnersuche.json` (Abschnitt
 * "Flirt & Dating Überblick"). Es werden hier keine Zahlen ergänzt, die nicht
 * schon im Artikel stehen.
 *
 * Der Flirt-Faktor ist – wie auf den deutschen Stadtseiten – eine redaktionelle
 * Einschätzung von ab50.ch und keine amtliche Statistik. Er bewertet
 * Kontaktbasis (Stadtgrösse), Vielfalt der Quartiere und die Qualität der
 * Treffpunkte für entspannte Dates ab 50.
 *
 * `einpersonenhaushalte` ist vorbereitet, aber bewusst leer: dafür liegen noch
 * keine belegten Werte pro Gemeinde vor. Sobald ein Wert gesetzt ist, erscheint
 * die Kachel automatisch anstelle der dritten Kachel.
 */

export type ChPlace = {
  name: string;
  /** Kurzform für das Badge, z. B. "Altstadt" oder "Park". */
  typ: string;
  /** Zweite Zeile im Badge, z. B. "Spaziergang / Aussicht". */
  kategorie: string;
  /** Warum der Ort für ein erstes Treffen taugt. */
  tipp: string;
};

export type ChCityFacts = {
  /** Anzeigewert exakt wie im Artikel, z. B. "452.421". */
  einwohner: string;
  /** Erläuterung unter der Kachel. */
  einwohnerHinweis: string;
  /** Dritte Kachel, solange keine Haushaltsdaten vorliegen. */
  dritteKachel: { label: string; wert: string; beschreibung: string };
  /** Anteil Einpersonenhaushalte in Prozent – noch nicht belegt. */
  einpersonenhaushalte?: { prozent: string; hinweis: string };
  flirtFaktor: number;
  flirtFaktorText: string;
  /** Kurze Chips im Hero. */
  heroChips: string[];
  treffpunkte: ChPlace[];
};

export const chCityFacts: Record<string, ChCityFacts> = {
  zuerich: {
    einwohner: "452.421",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Stadtkreise",
      wert: "12",
      beschreibung: "Von der Altstadt bis ins Seefeld – jeder Kreis bietet andere Orte zum Kennenlernen.",
    },
    flirtFaktor: 88,
    flirtFaktorText:
      "Grösste Stadt der Schweiz, dichtes Kulturangebot und viele ruhige Orte am Wasser – das ergibt eine sehr gute Ausgangslage für neue Kontakte ab 50.",
    heroChips: ["88 Flirt-Faktor", "452.421 Einwohner", "12 Stadtkreise", "Kultur & Seeufer"],
    treffpunkte: [
      {
        name: "Cabaret Voltaire",
        typ: "Kultur",
        kategorie: "Kultur / Gespräch",
        tipp: "Kleiner Kulturort mit Geschichte – gibt von allein Gesprächsstoff für ein erstes Treffen.",
      },
      {
        name: "Kronenhalle",
        typ: "Restaurant",
        kategorie: "Essen / Stilvoll",
        tipp: "Klassiker für einen stilvollen Abend, wenn ihr euch schon einmal gesehen habt.",
      },
      {
        name: "Pumpstation Seefeld",
        typ: "Seeufer",
        kategorie: "Aussicht / Apéro",
        tipp: "Direkt am Wasser: gut für einen kurzen Apéro ohne Verpflichtung.",
      },
    ],
  },

  genf: {
    einwohner: "210.601",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Museen",
      wert: "über 40",
      beschreibung: "Kunst und Geschichte liefern natürliche Gesprächsthemen für ein ruhiges Kennenlernen.",
    },
    flirtFaktor: 84,
    flirtFaktorText:
      "Internationale Stadt am Genfersee mit viel Kultur und langen Promenaden – gute Chancen auf Begegnungen mit Lebenserfahrung und Stil.",
    heroChips: ["84 Flirt-Faktor", "210.601 Einwohner", "über 40 Museen", "Seeufer & Altstadt"],
    treffpunkte: [
      {
        name: "Genfer Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Kultur",
        tipp: "Enge Gassen und Cafés: ideal für ein erstes Treffen, das man jederzeit verlängern kann.",
      },
      {
        name: "Promenade am Genfersee",
        typ: "Promenade",
        kategorie: "Spaziergang / Aussicht",
        tipp: "Spazieren statt gegenübersitzen – nimmt einem ersten Date viel Anspannung.",
      },
      {
        name: "Les Pâquis",
        typ: "Quartier",
        kategorie: "Café / Lebendig",
        tipp: "Lebendiges Viertel mit vielen kleinen Lokalen für einen unkomplizierten Kaffee.",
      },
    ],
  },

  basel: {
    einwohner: "183.564",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Stadtviertel",
      wert: "19",
      beschreibung: "Von der Altstadt bis Kleinbasel – jedes Viertel hat seinen eigenen Charakter.",
    },
    flirtFaktor: 83,
    flirtFaktorText:
      "Fast 40 Museen, Rheinpromenade und eine kompakte Altstadt: Basel verbindet Kultur und entspannte Treffpunkte besonders gut.",
    heroChips: ["83 Flirt-Faktor", "183.564 Einwohner", "19 Stadtviertel", "Rhein & Museen"],
    treffpunkte: [
      {
        name: "Basler Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Café",
        tipp: "Kurze Wege, viele Cafés – gut für ein erstes Treffen ohne grosse Planung.",
      },
      {
        name: "Rheinpromenade",
        typ: "Promenade",
        kategorie: "Spaziergang / Aussicht",
        tipp: "Am Wasser entlang reden lässt Pausen im Gespräch ganz natürlich wirken.",
      },
      {
        name: "Kleinbasel",
        typ: "Quartier",
        kategorie: "Essen / Lebendig",
        tipp: "Entspannte Lokale auf der anderen Rheinseite, wenn aus dem Kaffee ein Abend wird.",
      },
    ],
  },

  bern: {
    einwohner: "146.867",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "UNESCO-Altstadt",
      wert: "seit 1983",
      beschreibung: "Arkaden, kleine Plätze und historische Gassen machen Spaziergänge zum Selbstläufer.",
    },
    flirtFaktor: 82,
    flirtFaktorText:
      "UNESCO-Altstadt, Rosengarten und das Aareufer: Bern bietet viele ruhige Orte, an denen ein erstes Gespräch leicht in Gang kommt.",
    heroChips: ["82 Flirt-Faktor", "146.867 Einwohner", "UNESCO-Altstadt", "Aare & Arkaden"],
    treffpunkte: [
      {
        name: "Berner Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Arkaden",
        tipp: "Unter den Arkaden könnt ihr auch bei Regen stundenlang laufen und reden.",
      },
      {
        name: "Rosengarten",
        typ: "Park",
        kategorie: "Aussicht / Café",
        tipp: "Der Blick über die Altstadt ist ein guter Einstieg, wenn beide etwas nervös sind.",
      },
      {
        name: "Aareufer",
        typ: "Flussufer",
        kategorie: "Spaziergang / Natur",
        tipp: "Ruhig, grün und mitten in der Stadt – ideal für ein zwangloses erstes Treffen.",
      },
    ],
  },

  lausanne: {
    einwohner: "151.200",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Museen",
      wert: "über 30",
      beschreibung: "Ausstellungen und kreative Orte geben Gesprächsstoff über den Smalltalk hinaus.",
    },
    flirtFaktor: 80,
    flirtFaktorText:
      "17 Quartiere zwischen Altstadt, Seeufer und Flon: Lausanne bietet für jede Stimmung den passenden Treffpunkt.",
    heroChips: ["80 Flirt-Faktor", "151.200 Einwohner", "17 Quartiere", "Genfersee & Kultur"],
    treffpunkte: [
      {
        name: "Altstadt Lausanne",
        typ: "Altstadt",
        kategorie: "Spaziergang / Kultur",
        tipp: "Historischer Kern mit Kathedrale – schöner Startpunkt für ein längeres Gespräch.",
      },
      {
        name: "Ouchy",
        typ: "Seeufer",
        kategorie: "Promenade / Aussicht",
        tipp: "Direkt am Genfersee: ein Spaziergang hier wirkt nie wie ein Verhör.",
      },
      {
        name: "Flon-Viertel",
        typ: "Quartier",
        kategorie: "Café / Kreativ",
        tipp: "Modernes Viertel mit Cafés und Kultur, wenn es etwas lebendiger sein darf.",
      },
    ],
  },

  winterthur: {
    einwohner: "122.758",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Museen & Kulturorte",
      wert: "über 20",
      beschreibung: "Winterthur gilt als Kulturstadt – gute Anlässe für ein Treffen am Tag.",
    },
    flirtFaktor: 76,
    flirtFaktorText:
      "Kulturstadt mit viel Grün: Museen, Parks und die Altstadt machen entspannte Tagesdates in Winterthur besonders einfach.",
    heroChips: ["76 Flirt-Faktor", "122.758 Einwohner", "über 20 Museen", "Parks & Altstadt"],
    treffpunkte: [
      {
        name: "Winterthurer Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Café",
        tipp: "Autofreie Gassen und viele Cafés – unkompliziert für ein erstes Kennenlernen.",
      },
      {
        name: "Lokstadt",
        typ: "Quartier",
        kategorie: "Kultur / Modern",
        tipp: "Altes Industrieareal, heute lebendig: gibt sofort etwas zu erzählen.",
      },
      {
        name: "Teuchelweiher",
        typ: "Park",
        kategorie: "Spaziergang / Natur",
        tipp: "Kleiner Weiher mitten in der Stadt, gut für eine ruhige Runde zu zweit.",
      },
    ],
  },

  "st-gallen": {
    einwohner: "83.843",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Stiftsbezirk",
      wert: "UNESCO-Welterbe",
      beschreibung: "Stiftsbibliothek, Textilmuseum und Theater liefern Anlässe für ein Treffen mit Tiefgang.",
    },
    flirtFaktor: 74,
    flirtFaktorText:
      "Überschaubare Stadt mit grossem Kulturangebot und den Drei Weieren als Naherholung – gute Mischung für Dates ohne Nachtleben.",
    heroChips: ["74 Flirt-Faktor", "83.843 Einwohner", "UNESCO-Stiftsbezirk", "Kultur & Hügel"],
    treffpunkte: [
      {
        name: "St. Galler Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Kultur",
        tipp: "Erker, Gassen und Cafés rund um den Stiftsbezirk – kurzer Weg, viel zu sehen.",
      },
      {
        name: "Drei Weieren",
        typ: "Naherholung",
        kategorie: "Aussicht / Natur",
        tipp: "Über der Stadt gelegen: der Aufstieg nimmt einem ersten Treffen die Steifheit.",
      },
      {
        name: "Rosenberg",
        typ: "Aussicht",
        kategorie: "Spaziergang / Aussicht",
        tipp: "Ruhiger Hang mit Blick über St. Gallen, ideal für ein längeres Gespräch.",
      },
    ],
  },

  lugano: {
    einwohner: "68.633",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Quartiere",
      wert: "21",
      beschreibung: "Vom lebendigen Zentrum bis ins elegante Castagnola – viele unterschiedliche Stimmungen.",
    },
    flirtFaktor: 75,
    flirtFaktorText:
      "Südliches Klima, Seepromenade und internationale Mischung: In Lugano fallen entspannte Treffen im Freien besonders leicht.",
    heroChips: ["75 Flirt-Faktor", "68.633 Einwohner", "21 Quartiere", "See & Dolce Vita"],
    treffpunkte: [
      {
        name: "Piazza della Riforma",
        typ: "Platz",
        kategorie: "Café / Zentral",
        tipp: "Zentraler Treffpunkt mit Terrassen – leicht zu finden, leicht wieder zu verlassen.",
      },
      {
        name: "Parco Ciani",
        typ: "Park",
        kategorie: "Spaziergang / Natur",
        tipp: "Grosser Seepark: schattige Wege und Bänke für ein ruhiges erstes Gespräch.",
      },
      {
        name: "Seepromenade Lugano",
        typ: "Promenade",
        kategorie: "Spaziergang / Aussicht",
        tipp: "Am Wasser entlang mit Bergblick – funktioniert zu jeder Jahreszeit.",
      },
    ],
  },

  fribourg: {
    einwohner: "41.000",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Stadtteile",
      wert: "7",
      beschreibung: "Altstadt, Pérolles, Bourg, Auge und Neuveville bieten sehr unterschiedliche Atmosphären.",
    },
    flirtFaktor: 70,
    flirtFaktorText:
      "Zweisprachige Stadt an der Saane mit mittelalterlicher Altstadt – überschaubar, aber überraschend vielfältig für erste Treffen.",
    heroChips: ["70 Flirt-Faktor", "41.000 Einwohner", "7 Stadtteile", "Gotik & Saane"],
    treffpunkte: [
      {
        name: "Altstadt Freiburg",
        typ: "Altstadt",
        kategorie: "Spaziergang / Kultur",
        tipp: "Mittelalterliche Gassen und Brücken: es gibt ständig etwas zu zeigen und zu erklären.",
      },
      {
        name: "Quartier Pérolles",
        typ: "Quartier",
        kategorie: "Café / Lebendig",
        tipp: "Belebtes Viertel mit Cafés – gut für ein kurzes, unverbindliches erstes Treffen.",
      },
      {
        name: "Saaneufer",
        typ: "Flussufer",
        kategorie: "Spaziergang / Aussicht",
        tipp: "Wege entlang der Saane mit Blick auf die Altstadt, ruhig und entspannt.",
      },
    ],
  },

  thun: {
    einwohner: "44.663",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Quartiere",
      wert: "13",
      beschreibung: "Von ruhigen Wohnlagen bis zur lebendigen Innenstadt – jedes Quartier mit eigenem Charakter.",
    },
    flirtFaktor: 72,
    flirtFaktorText:
      "Zwischen Thunersee, Aare und Berner Oberland: die rund zwei Kilometer lange Aarepromenade allein ist schon ein gutes erstes Date.",
    heroChips: ["72 Flirt-Faktor", "44.663 Einwohner", "13 Quartiere", "See & Alpenblick"],
    treffpunkte: [
      {
        name: "Thuner Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Café",
        tipp: "Die hochgelegenen Ladenstege sind ungewöhnlich genug, um das Eis zu brechen.",
      },
      {
        name: "Aarepromenade",
        typ: "Promenade",
        kategorie: "Spaziergang / Wasser",
        tipp: "Rund zwei Kilometer am Wasser – genug Zeit für ein ruhiges Gespräch.",
      },
      {
        name: "Schadaupark",
        typ: "Park",
        kategorie: "Natur / Aussicht",
        tipp: "Park am See mit Blick auf die Alpen, sehr entspannt für ein erstes Treffen.",
      },
    ],
  },

  koeniz: {
    einwohner: "44.622",
    einwohnerHinweis: "Einwohnerzahl laut Gemeindeporträt im Artikel.",
    dritteKachel: {
      label: "Ortsteile",
      wert: "11",
      beschreibung: "Von Liebefeld über Wabern bis zu naturnahen Lagen – viel Auswahl direkt bei Bern.",
    },
    flirtFaktor: 68,
    flirtFaktorText:
      "Viel Grün, Nähe zum Gurten und direkte Anbindung an Bern: Köniz kombiniert Dorfgefühl mit städtischen Möglichkeiten.",
    heroChips: ["68 Flirt-Faktor", "44.622 Einwohner", "11 Ortsteile", "Gurten & viel Grün"],
    treffpunkte: [
      {
        name: "Schloss Köniz",
        typ: "Kultur",
        kategorie: "Kultur / Gespräch",
        tipp: "Historischer Ort mit Gastronomie – ein klarer Treffpunkt, den jeder findet.",
      },
      {
        name: "Gurten",
        typ: "Hausberg",
        kategorie: "Aussicht / Natur",
        tipp: "Mit der Bahn hoch, Aussicht geniessen: das Programm trägt das Gespräch von allein.",
      },
      {
        name: "Wohlensee",
        typ: "See",
        kategorie: "Spaziergang / Natur",
        tipp: "Ruhige Uferwege, wenn ihr euch in Ruhe und ohne Publikum kennenlernen wollt.",
      },
    ],
  },

  "biel-bienne": {
    einwohner: "163.000",
    einwohnerHinweis: "Einwohner im weiteren Raum Biel laut Regionsporträt im Artikel.",
    dritteKachel: {
      label: "Gemeinden im Raum Biel",
      wert: "50+",
      beschreibung: "Begegnungen entstehen nicht nur in der Stadt, sondern auch am See und im Seeland.",
    },
    flirtFaktor: 74,
    flirtFaktorText:
      "Zweisprachige Region zwischen Bielersee und Jura: die Mischung aus Stadt, Seegemeinden und Umland vergrössert den Suchradius spürbar.",
    heroChips: ["74 Flirt-Faktor", "163.000 Einwohner (Raum Biel)", "50+ Gemeinden", "See & Zweisprachigkeit"],
    treffpunkte: [
      {
        name: "Altstadt von Biel",
        typ: "Altstadt",
        kategorie: "Spaziergang / Café",
        tipp: "Kompakte Altstadt mit Brunnen und Cafés – kurze Wege, entspannte Stimmung.",
      },
      {
        name: "Strandboden am Bielersee",
        typ: "Seeufer",
        kategorie: "Spaziergang / Wasser",
        tipp: "Grosse Uferanlage direkt am See: gut für einen Spaziergang ohne festen Plan.",
      },
      {
        name: "St. Petersinsel",
        typ: "Ausflug",
        kategorie: "Natur / Schiff",
        tipp: "Mit dem Schiff hin: ein Ausflug, der ein zweites Treffen fast von selbst mitbringt.",
      },
    ],
  },

  schaffhausen: {
    einwohner: "39.000",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Wahrzeichen",
      wert: "Munot & Rheinfall",
      beschreibung: "Zwei Ausflugsziele direkt vor der Tür, die als Treffpunkt sofort verständlich sind.",
    },
    flirtFaktor: 70,
    flirtFaktorText:
      "Mittelalterliche Altstadt mit prächtigen Erkern, der Munot über der Stadt und der Rheinfall nebenan – viele gute Gründe für ein Treffen draussen.",
    heroChips: ["70 Flirt-Faktor", "39.000 Einwohner", "Munot & Rheinfall", "Altstadt am Rhein"],
    treffpunkte: [
      {
        name: "Schaffhauser Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Kultur",
        tipp: "Die Erker sind ein dankbares Gesprächsthema, wenn der Anfang schwerfällt.",
      },
      {
        name: "Rheinfall",
        typ: "Ausflug",
        kategorie: "Natur / Aussicht",
        tipp: "Grösster Wasserfall Europas: beeindruckend genug, dass Pausen nicht unangenehm werden.",
      },
      {
        name: "Munot",
        typ: "Festung",
        kategorie: "Aussicht / Kultur",
        tipp: "Rundgang auf der Festung mit Blick über Stadt und Rhein – kurz, aber besonders.",
      },
    ],
  },

  "la-chaux-de-fonds": {
    einwohner: "37.844",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Quartiere",
      wert: "12",
      beschreibung: "Vom Zentrum bis zu höher gelegenen Aussichtslagen – überschaubar und gut erreichbar.",
    },
    flirtFaktor: 66,
    flirtFaktorText:
      "UNESCO-Welterbe für Uhrmacher-Städtebau: die besondere Stadtplanung und die Jura-Lage passen zu Menschen, die Gespräche mit Tiefe mögen.",
    heroChips: ["66 Flirt-Faktor", "37.844 Einwohner", "12 Quartiere", "UNESCO & Jura"],
    treffpunkte: [
      {
        name: "Stadtzentrum",
        typ: "Zentrum",
        kategorie: "Café / Kurze Wege",
        tipp: "Das Rastermuster macht Treffpunkte leicht zu beschreiben und leicht zu finden.",
      },
      {
        name: "Espacité",
        typ: "Platz",
        kategorie: "Zentral / Aussicht",
        tipp: "Zentraler Punkt mit Turm und Aussicht – ein klarer Treffpunkt ohne Suchen.",
      },
      {
        name: "Mont Soleil",
        typ: "Ausflug",
        kategorie: "Natur / Aussicht",
        tipp: "Ausflug in den Jura mit weitem Blick, wenn ihr mehr Zeit miteinander wollt.",
      },
    ],
  },

  luzern: {
    einwohner: "83.351",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Quartiere",
      wert: "14",
      beschreibung: "Von der Altstadt über Wohnquartiere bis zu ruhigen Lagen am See und am Hang.",
    },
    flirtFaktor: 78,
    flirtFaktorText:
      "Vierwaldstättersee, Kapellbrücke, Seepromenade und Pilatusblick: Luzern macht es leicht, ein erstes Treffen schön zu gestalten.",
    heroChips: ["78 Flirt-Faktor", "83.351 Einwohner", "14 Quartiere", "See & Altstadt"],
    treffpunkte: [
      {
        name: "Luzerner Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Café",
        tipp: "Bemalte Fassaden und kleine Plätze – kurze Wege, viel Atmosphäre.",
      },
      {
        name: "Seepromenade",
        typ: "Promenade",
        kategorie: "Spaziergang / Aussicht",
        tipp: "Am Wasser mit Bergblick: der Klassiker für ein entspanntes erstes Kennenlernen.",
      },
      {
        name: "Pilatus",
        typ: "Ausflug",
        kategorie: "Natur / Aussicht",
        tipp: "Halbtagesausflug für ein zweites Date, wenn der erste Kaffee gut gelaufen ist.",
      },
    ],
  },

  chur: {
    einwohner: "41.713",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Älteste Stadt",
      wert: "der Schweiz",
      beschreibung: "Malerische Altstadt mit Museen und Galerien, dazu der Hausberg direkt am Zentrum.",
    },
    flirtFaktor: 70,
    flirtFaktorText:
      "Älteste Stadt der Schweiz mit Altstadt, Kultur und dem Hausberg Brambrüesch direkt vor der Tür – überschaubar, aber abwechslungsreich.",
    heroChips: ["70 Flirt-Faktor", "41.713 Einwohner", "Älteste Stadt der Schweiz", "Alpen & Altstadt"],
    treffpunkte: [
      {
        name: "Churer Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Café",
        tipp: "Autofreie Gassen mit Cafés und kleinen Läden: unkompliziert für ein erstes Treffen.",
      },
      {
        name: "Arcas Platz",
        typ: "Platz",
        kategorie: "Café / Zentral",
        tipp: "Farbiger Platz mit Terrassen – leicht zu finden und angenehm zum Sitzen.",
      },
      {
        name: "Brambrüesch",
        typ: "Hausberg",
        kategorie: "Natur / Aussicht",
        tipp: "Mit der Gondel direkt aus der Stadt hinauf: ein Ausflug ohne grossen Aufwand.",
      },
    ],
  },

  zug: {
    einwohner: "31.000",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Lage",
      wert: "See & Zugerberg",
      beschreibung: "Zugersee, Altstadt und Zugerberg liegen nah beieinander – ideal für spontane Treffen.",
    },
    flirtFaktor: 72,
    flirtFaktorText:
      "Kompakte Stadt mit hoher Lebensqualität: Altstadt, Seeufer und Zugerberg sind alle schnell erreichbar und eignen sich für ruhige Dates.",
    heroChips: ["72 Flirt-Faktor", "31.000 Einwohner", "See & Zugerberg", "Altstadt & Aussicht"],
    treffpunkte: [
      {
        name: "Zuger Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Café",
        tipp: "Klein, hübsch und übersichtlich – man verpasst sich hier praktisch nicht.",
      },
      {
        name: "Seeufer Zug",
        typ: "Seeufer",
        kategorie: "Promenade / Aussicht",
        tipp: "Uferweg mit Alpenblick: besonders schön am späten Nachmittag.",
      },
      {
        name: "Zugerberg",
        typ: "Hausberg",
        kategorie: "Natur / Aussicht",
        tipp: "Mit der Bahn hinauf und oben etwas trinken – ein Date mit klarem Ablauf.",
      },
    ],
  },

  aarau: {
    einwohner: "22.892",
    einwohnerHinweis: "Einwohnerzahl laut Stadtporträt im Artikel.",
    dritteKachel: {
      label: "Altstadt",
      wert: "Schöne Giebel",
      beschreibung: "Verzierte Dachgiebel, das Aargauer Kunsthaus und das Aareufer liegen dicht beieinander.",
    },
    flirtFaktor: 67,
    flirtFaktorText:
      "Kompakte Kantonshauptstadt mit aktiver Kulturszene: kurze Wege zwischen Altstadt, Kunsthaus und Aareufer machen Treffen unkompliziert.",
    heroChips: ["67 Flirt-Faktor", "22.892 Einwohner", "Stadt der schönen Giebel", "Aare & Kultur"],
    treffpunkte: [
      {
        name: "Aarauer Altstadt",
        typ: "Altstadt",
        kategorie: "Spaziergang / Café",
        tipp: "Die bemalten Dachgiebel sind ein einfacher Gesprächseinstieg beim Losgehen.",
      },
      {
        name: "Aareufer",
        typ: "Flussufer",
        kategorie: "Spaziergang / Natur",
        tipp: "Grüne Wege direkt am Wasser, ruhig genug für ein längeres Gespräch.",
      },
      {
        name: "Schloss Aarau",
        typ: "Kultur",
        kategorie: "Aussicht / Geschichte",
        tipp: "Blick Richtung Schloss als Ziel für einen kurzen Spaziergang mit klarem Ende.",
      },
    ],
  },
};

export function getChCityFacts(slug: string): ChCityFacts | null {
  return chCityFacts[slug] ?? null;
}
