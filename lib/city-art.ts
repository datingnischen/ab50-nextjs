export type CityArtPalette = {
  sky1: string;
  sky2: string;
  sky3: string;
  sun: string;
  sunGlow: string;
  far: string;
  mid: string;
  wall: string;
  wallDark: string;
  roof: string;
  roofDark: string;
  water1: string;
  water2: string;
  accent: string;
  band1: string;
  band2: string;
};

export type CityArtConfig = {
  /** Kurze Charakterzeile, erscheint im Poster-Band der Grafik. */
  tagline: string;
  /** Beschreibt das Motiv fuer den Alt-Text. */
  motif: string;
  palette: CityArtPalette;
};

const dusk: CityArtPalette = {
  sky1: "#f7e5f0",
  sky2: "#ffd9cf",
  sky3: "#ffeeda",
  sun: "#ffc87a",
  sunGlow: "#ffe6bd",
  far: "#b7a6c9",
  mid: "#94809f",
  wall: "#5b4769",
  wallDark: "#443252",
  roof: "#b4505f",
  roofDark: "#8d3a48",
  water1: "#d3dcef",
  water2: "#a5b8dd",
  accent: "#c0455a",
  band1: "#2e2340",
  band2: "#4b3559",
};

function palette(overrides: Partial<CityArtPalette>): CityArtPalette {
  return { ...dusk, ...overrides };
}

export const cityArt: Record<string, CityArtConfig> = {
  zuerich: {
    tagline: "Limmat, Altstadt & Kultur",
    motif: "Grossmünster, Fraumünster und St. Peter an der Limmat",
    palette: palette({
      sky1: "#f3e3f2",
      sky2: "#ffd6cd",
      far: "#a99cc6",
      wall: "#53466f",
      wallDark: "#3d3357",
      roof: "#b8515c",
      accent: "#3f8f86",
      band1: "#25203c",
      band2: "#433a63",
    }),
  },
  genf: {
    tagline: "Jet d’Eau, See & Weltstadtflair",
    motif: "Jet d’Eau, Kathedrale St. Pierre und der Genfersee",
    palette: palette({
      sky1: "#ecdff4",
      sky2: "#ffd2c6",
      sky3: "#ffedd8",
      far: "#c3bede",
      mid: "#9a95bd",
      wall: "#4d4a76",
      wallDark: "#383560",
      water1: "#c9daf2",
      water2: "#8fb0de",
      accent: "#2f7fb5",
      band1: "#1f2a4a",
      band2: "#3b4a76",
    }),
  },
  basel: {
    tagline: "Rhein, Münster & Museumsstadt",
    motif: "Basler Münster mit roten Türmen und die Mittlere Brücke",
    palette: palette({
      sky1: "#fae2e6",
      sky2: "#ffd2bd",
      sky3: "#ffeed3",
      far: "#c4a9b4",
      mid: "#a98a94",
      wall: "#6b4553",
      wallDark: "#52333f",
      roof: "#c0503f",
      roofDark: "#973b2f",
      water1: "#d8dbe8",
      water2: "#a8aed0",
      accent: "#b8442f",
      band1: "#3a2230",
      band2: "#5c3546",
    }),
  },
  bern: {
    tagline: "Zytglogge, Aare & Altstadtgassen",
    motif: "Zytglogge, Berner Münster und die Aareschlaufe",
    palette: palette({
      sky1: "#f7e6e2",
      sky2: "#ffd8c0",
      sky3: "#fff0d6",
      far: "#b6aab2",
      mid: "#94868d",
      wall: "#5d5560",
      wallDark: "#453f4c",
      roof: "#b9573f",
      roofDark: "#8f4130",
      water1: "#cfe0e4",
      water2: "#98bcc4",
      accent: "#c58a2e",
      band1: "#2e2a2f",
      band2: "#4c4451",
    }),
  },
  lausanne: {
    tagline: "Kathedrale, Hanglage & Seeblick",
    motif: "Kathedrale von Lausanne über dem Genfersee",
    palette: palette({
      sky1: "#efe0f3",
      sky2: "#ffd4cb",
      far: "#b5a8cf",
      mid: "#90809f",
      wall: "#554673",
      wallDark: "#3f3359",
      roof: "#a85062",
      water1: "#cbd9f0",
      water2: "#93aedc",
      accent: "#5b6fb8",
      band1: "#241f3f",
      band2: "#423a66",
    }),
  },
  winterthur: {
    tagline: "Stadtkirche, Parks & Industriekultur",
    motif: "Stadtkirche und die alten Industriehallen von Winterthur",
    palette: palette({
      sky1: "#f6e6e6",
      sky2: "#ffd9c4",
      sky3: "#fff0d9",
      far: "#a9b0a5",
      mid: "#87917f",
      wall: "#5a5350",
      wallDark: "#433d3b",
      roof: "#b05a45",
      roofDark: "#8a4434",
      water1: "#d6dfd6",
      water2: "#a8b7a6",
      accent: "#7a9455",
      band1: "#2c2b27",
      band2: "#4a4840",
    }),
  },
  "st-gallen": {
    tagline: "Stiftsbezirk, Hügel & Kultur",
    motif: "Barocke Kathedrale von St. Gallen vor grünen Hügeln",
    palette: palette({
      sky1: "#f8e8e5",
      sky2: "#ffdcc0",
      sky3: "#fff2dc",
      far: "#a9b69f",
      mid: "#84957a",
      wall: "#6b6152",
      wallDark: "#4f4739",
      roof: "#7f8f6f",
      roofDark: "#5f6d52",
      water1: "#dbe4d6",
      water2: "#aec0a5",
      accent: "#3f7a5c",
      band1: "#2b2d24",
      band2: "#4a4d3d",
    }),
  },
  lugano: {
    tagline: "Palmen, Seepromenade & Dolce Vita",
    motif: "Luganersee mit Palmen und den Bergen San Salvatore und Brè",
    palette: palette({
      sky1: "#ffe6e0",
      sky2: "#ffcfb4",
      sky3: "#fff0cd",
      far: "#9fb6c2",
      mid: "#78a0a6",
      wall: "#4e6b70",
      wallDark: "#3a5257",
      roof: "#cf6b45",
      roofDark: "#a5522f",
      water1: "#bfe1e2",
      water2: "#7fc0c3",
      accent: "#e07a3c",
      band1: "#1f4147",
      band2: "#356067",
    }),
  },
  fribourg: {
    tagline: "Gotik, Saane & zwei Sprachen",
    motif: "Kathedrale St. Nikolaus über der Saaneschlucht",
    palette: palette({
      sky1: "#f2e4ec",
      sky2: "#ffd7c8",
      far: "#a8a6b5",
      mid: "#85838f",
      wall: "#57565f",
      wallDark: "#3f3e47",
      roof: "#a85a45",
      roofDark: "#814334",
      water1: "#cddde2",
      water2: "#98b7c0",
      accent: "#4f7f92",
      band1: "#272a31",
      band2: "#43474f",
    }),
  },
  thun: {
    tagline: "Schloss, Aare & Berner Oberland",
    motif: "Schloss Thun vor den Gipfeln des Berner Oberlands",
    palette: palette({
      sky1: "#f4e6ef",
      sky2: "#ffd8ca",
      sky3: "#fff0dd",
      far: "#c4cadd",
      mid: "#98a3bd",
      wall: "#5d5a70",
      wallDark: "#464458",
      roof: "#b05548",
      roofDark: "#873f35",
      water1: "#c2e3e4",
      water2: "#84c4c8",
      accent: "#2f8c94",
      band1: "#23303c",
      band2: "#3f5260",
    }),
  },
  koeniz: {
    tagline: "Schloss, Gurten & viel Grün",
    motif: "Schloss Köniz mit Feldern und dem Gurten",
    palette: palette({
      sky1: "#f7e9e2",
      sky2: "#ffdfc0",
      sky3: "#fff4dd",
      far: "#a9b89f",
      mid: "#89a078",
      wall: "#6a6353",
      wallDark: "#4e483c",
      roof: "#a96045",
      roofDark: "#814835",
      water1: "#dfe8d5",
      water2: "#b3c7a2",
      accent: "#6c9450",
      band1: "#2b2e23",
      band2: "#4a503c",
    }),
  },
  "biel-bienne": {
    tagline: "Uhrenstadt, See & Zweisprachigkeit",
    motif: "Bielersee mit Rebhängen und dem Uhrenmotiv der Stadt",
    palette: palette({
      sky1: "#f6e7e9",
      sky2: "#ffdcbd",
      sky3: "#fff2d6",
      far: "#b0b296",
      mid: "#8d9472",
      wall: "#5a5551",
      wallDark: "#43403c",
      roof: "#ae5e44",
      roofDark: "#853f2f",
      water1: "#cbdde9",
      water2: "#93b6cb",
      accent: "#c29334",
      band1: "#2c2b26",
      band2: "#4b4a3e",
    }),
  },
  schaffhausen: {
    tagline: "Munot, Erker & Rheinfall",
    motif: "Munot-Festung und der Rheinfall bei Schaffhausen",
    palette: palette({
      sky1: "#fae8e0",
      sky2: "#ffdab9",
      sky3: "#fff2d5",
      far: "#b6ab9b",
      mid: "#948876",
      wall: "#6f6250",
      wallDark: "#53483a",
      roof: "#b05a3c",
      roofDark: "#89422b",
      water1: "#cfe3e8",
      water2: "#9bc2cd",
      accent: "#b8802f",
      band1: "#2f2a22",
      band2: "#50483a",
    }),
  },
  "la-chaux-de-fonds": {
    tagline: "Uhrmacherstadt im Jura",
    motif: "Rasterstadt und Uhrwerk-Motiv der Uhrmacherstadt im Jura",
    palette: palette({
      sky1: "#e9e4f2",
      sky2: "#ffd8d0",
      sky3: "#fff0e2",
      far: "#b3b7ca",
      mid: "#8d92a8",
      wall: "#4f5165",
      wallDark: "#3a3c4e",
      roof: "#8d6a74",
      roofDark: "#6b4e57",
      water1: "#dde3ef",
      water2: "#b1bcd4",
      accent: "#c08a3a",
      band1: "#242737",
      band2: "#414559",
    }),
  },
  luzern: {
    tagline: "Kapellbrücke, See & Pilatus",
    motif: "Kapellbrücke mit Wasserturm vor dem Pilatus",
    palette: palette({
      sky1: "#f8e6e8",
      sky2: "#ffd6b8",
      sky3: "#fff0d2",
      far: "#b3aec8",
      mid: "#8d89a6",
      wall: "#5c5165",
      wallDark: "#453c4d",
      roof: "#b85a44",
      roofDark: "#8e4231",
      water1: "#c6dbee",
      water2: "#8db2da",
      accent: "#c8813a",
      band1: "#252436",
      band2: "#433f5b",
    }),
  },
  chur: {
    tagline: "Älteste Stadt, Alpen & Reben",
    motif: "Churer Altstadt mit Kathedrale vor dem Calanda",
    palette: palette({
      sky1: "#f6e3ea",
      sky2: "#ffd4c2",
      sky3: "#ffeed6",
      far: "#c0bdd2",
      mid: "#9791ab",
      wall: "#63566a",
      wallDark: "#4a3f51",
      roof: "#b05744",
      roofDark: "#874030",
      water1: "#d4dbe8",
      water2: "#a6b2cd",
      accent: "#8d5c8f",
      band1: "#2b2537",
      band2: "#4a4159",
    }),
  },
  zug: {
    tagline: "Zytturm, See & Kirschblüten",
    motif: "Zuger Zytturm am See mit Kirschblüten und der Rigi",
    palette: palette({
      sky1: "#fce4ee",
      sky2: "#ffd6d3",
      sky3: "#fff0de",
      far: "#bdb2cd",
      mid: "#9589a6",
      wall: "#5b5068",
      wallDark: "#453b50",
      roof: "#5f86b5",
      roofDark: "#46658c",
      water1: "#c8dcf0",
      water2: "#8fb4dd",
      accent: "#d9698c",
      band1: "#2a2440",
      band2: "#483d5f",
    }),
  },
  aarau: {
    tagline: "Stadt der schönen Giebel an der Aare",
    motif: "Bemalte Dachgiebel der Aarauer Altstadt an der Aare",
    palette: palette({
      sky1: "#f9e7e0",
      sky2: "#ffdcb8",
      sky3: "#fff3d8",
      far: "#b2b2a2",
      mid: "#8f907d",
      wall: "#6b5c4c",
      wallDark: "#4f4337",
      roof: "#bd6a3c",
      roofDark: "#8f4d29",
      water1: "#cee0e4",
      water2: "#9bbdc5",
      accent: "#b6852f",
      band1: "#2e2a21",
      band2: "#4e4738",
    }),
  },
};

export const fallbackCityArt: CityArtConfig = {
  tagline: "Altstadt, Natur & neue Begegnungen",
  motif: "Stilisierte Schweizer Stadtsilhouette",
  palette: dusk,
};

export function getCityArt(slug: string): CityArtConfig {
  return cityArt[slug] ?? fallbackCityArt;
}

/** Varianten, die als eigenstaendige SVG-Datei ausgeliefert werden. */
export type CityArtFileVariant = "card" | "thumb";

/** Pfad der vorgerenderten Stadtgrafik (siehe app/stadtbild/[file]/route.ts). */
export function cityArtImageSrc(slug: string, variant: CityArtFileVariant) {
  return `/stadtbild/${slug}-${variant}.svg`;
}

export function cityArtAltText(slug: string, name: string) {
  return `${name}: ${getCityArt(slug).motif}`;
}
