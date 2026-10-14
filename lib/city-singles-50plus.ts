import type { WpSourceItem } from "@/lib/wordpress";

/**
 * Geschaetzte Singlehaushalte ab 50 je Stadtseite.
 *
 * Grundlage sind die amtlichen Einpersonenhaushalte der Stadt. Darauf wird der
 * Anteil der Alleinlebenden ab 50 Jahren aus dem Mikrozensus 2025 (Destatis,
 * Erstergebnisse, getrennt nach West- und Ostdeutschland) angewendet. Die
 * Altersgruppe 45 bis unter 65 Jahre zaehlt dabei zu drei Vierteln (50 bis 64).
 */

type Region = "west" | "ost";

/** Alleinlebende 2025 in 1.000 nach Altersgruppen (Destatis, Mikrozensus-Erstergebnisse). */
const alleinlebende2025: Record<Region, { u25: number; a25bis45: number; a45bis65: number; a65bis85: number; ab85: number }> = {
  west: { u25: 931, a25bis45: 3906, a45bis65: 3853, a65bis85: 3764, ab85: 1163 },
  ost: { u25: 251, a25bis45: 996, a45bis65: 1062, a65bis85: 1078, ab85: 322 },
};

export function shareAb50(region: Region) {
  const g = alleinlebende2025[region];
  const total = g.u25 + g.a25bis45 + g.a45bis65 + g.a65bis85 + g.ab85;
  return (g.a45bis65 * 0.75 + g.a65bis85 + g.ab85) / total;
}

export const mikrozensusSource: WpSourceItem = {
  title: "Alleinstehende und Alleinlebende nach Alter (Mikrozensus 2025, Erstergebnisse)",
  url: "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Haushalte-Familien/Tabellen/4-1-alleinstehende.html",
  publisher: "Statistisches Bundesamt (Destatis)",
  date: "2025",
  note: "Grundlage für die Schätzung der Singlehaushalte ab 50: Anteil der Alleinlebenden ab 50 Jahren, getrennt nach West- und Ostdeutschland.",
};

type CitySingleHouseholds = {
  region: Region;
  /** Amtliche Zahl der Einpersonenhaushalte. */
  households: number;
  year: string;
  /** Nur gesetzt, wenn die Stadt die Zahl als Anteil veroeffentlicht und wir sie umrechnen. */
  derivedFrom?: string;
  source?: WpSourceItem;
};

export const citySingleHouseholds: Record<string, CitySingleHouseholds> = {
  "singles-berlin": { region: "ost", households: 1250000, year: "2024" },
  "singles-bremen": { region: "west", households: 149000, year: "2024" },
  "singles-dortmund": {
    region: "west",
    households: 159180,
    year: "2024",
    derivedFrom: "jeder zweite der 318.360 Haushalte",
  },
  "singles-dresden": { region: "ost", households: 166560, year: "2024" },
  "singles-duesseldorf": { region: "west", households: 201780, year: "2024" },
  "singles-hamburg": { region: "west", households: 597953, year: "2025" },
  "singles-hannover": { region: "west", households: 170438, year: "2023" },
  "singles-jena": {
    region: "ost",
    households: 33526,
    year: "2024",
    source: {
      title: "Stadtteilübersichten 2024",
      url: "https://statistik.jena.de/system/files/2025-12/Stadtteil%C3%BCbersichten_2024.pdf",
      publisher: "Stadt Jena, Team Datenmanagement und Statistik",
      date: "2024",
      note: "33.526 Einpersonenhaushalte von 61.332 statistischen Privathaushalten.",
    },
  },
  "singles-kassel": { region: "west", households: 59747, year: "2025" },
  "singles-koeln": { region: "west", households: 298905, year: "2025" },
  "singles-leipzig": { region: "ost", households: 210008, year: "2025" },
  "singles-muenchen": { region: "west", households: 472378, year: "2025" },
  "singles-nuernberg": {
    region: "west",
    households: 148027,
    year: "2024",
    derivedFrom: "50,8 % der 291.392 Haushalte",
  },
  "singles-stuttgart": { region: "west", households: 171000, year: "2024" },
};

function roundEstimate(value: number) {
  const step = value >= 20000 ? 1000 : 100;
  return Math.round(value / step) * step;
}

function formatNumber(value: number) {
  return value.toLocaleString("de-DE");
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)} %`;
}

export type Singles50PlusEstimate = {
  households: number;
  estimate: number;
  share: number;
  year: string;
  householdsLabel: string;
  derivedFrom?: string;
  description: string;
  sources: WpSourceItem[];
};

export function getSingles50PlusEstimate(slug: string): Singles50PlusEstimate | null {
  const entry = citySingleHouseholds[slug];
  if (!entry) return null;
  const share = shareAb50(entry.region);
  const estimate = roundEstimate(entry.households * share);
  const regionLabel = entry.region === "ost" ? "Ostdeutschland" : "Westdeutschland";
  const householdsLabel = entry.derivedFrom ? `ca. ${formatNumber(roundEstimate(entry.households))}` : formatNumber(entry.households);
  return {
    households: entry.households,
    estimate,
    share,
    year: entry.year,
    householdsLabel,
    derivedFrom: entry.derivedFrom,
    description: `Schätzung: ${householdsLabel} Einpersonenhaushalte (${entry.year}) × ${formatPercent(share)} – so hoch ist laut Mikrozensus 2025 der Anteil der Alleinlebenden ab 50 in ${regionLabel}. In jungen Großstädten eher etwas weniger.`,
    sources: [entry.source, mikrozensusSource].filter((source): source is WpSourceItem => Boolean(source)),
  };
}
