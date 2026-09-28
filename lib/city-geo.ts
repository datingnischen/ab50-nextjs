import maps from "../data/country-maps.json" with { type: "json" };
import type { MarketCode } from "./markets.ts";

/** Koordinaten und Region je Stadtseite – nur für Karte, Entfernungen und Filter (keine Inhalte). */
export type Geo = { lat: number; lon: number; region: string };

const GEO: Record<MarketCode, Record<string, Geo>> = {
  de: {
    berlin: { lat: 52.52, lon: 13.405, region: "Berlin" },
    bremen: { lat: 53.0793, lon: 8.8017, region: "Bremen" },
    dortmund: { lat: 51.5136, lon: 7.4653, region: "Nordrhein-Westfalen" },
    dresden: { lat: 51.0504, lon: 13.7373, region: "Sachsen" },
    duesseldorf: { lat: 51.2277, lon: 6.7735, region: "Nordrhein-Westfalen" },
    "frankfurt-am-main": { lat: 50.1109, lon: 8.6821, region: "Hessen" },
    freiburg: { lat: 47.999, lon: 7.8421, region: "Baden-Württemberg" },
    hamburg: { lat: 53.5511, lon: 9.9937, region: "Hamburg" },
    hannover: { lat: 52.3759, lon: 9.732, region: "Niedersachsen" },
    jena: { lat: 50.9271, lon: 11.5892, region: "Thüringen" },
    kassel: { lat: 51.3127, lon: 9.4797, region: "Hessen" },
    koeln: { lat: 50.9375, lon: 6.9603, region: "Nordrhein-Westfalen" },
    leipzig: { lat: 51.3397, lon: 12.3731, region: "Sachsen" },
    muenchen: { lat: 48.1351, lon: 11.582, region: "Bayern" },
    nuernberg: { lat: 49.4521, lon: 11.0767, region: "Bayern" },
    rosenheim: { lat: 47.8571, lon: 12.1181, region: "Bayern" },
    stuttgart: { lat: 48.7758, lon: 9.1829, region: "Baden-Württemberg" },
    suhl: { lat: 50.6091, lon: 10.6934, region: "Thüringen" },
  },
  ch: {
    zuerich: { lat: 47.3769, lon: 8.5417, region: "Zürich" },
    genf: { lat: 46.2044, lon: 6.1432, region: "Genf" },
    basel: { lat: 47.5596, lon: 7.5886, region: "Basel-Stadt" },
    bern: { lat: 46.948, lon: 7.4474, region: "Bern" },
    lausanne: { lat: 46.5197, lon: 6.6323, region: "Waadt" },
    winterthur: { lat: 47.4988, lon: 8.7237, region: "Zürich" },
    "st-gallen": { lat: 47.4245, lon: 9.3767, region: "St. Gallen" },
    lugano: { lat: 46.0037, lon: 8.9511, region: "Tessin" },
    fribourg: { lat: 46.8065, lon: 7.1619, region: "Freiburg" },
    thun: { lat: 46.758, lon: 7.628, region: "Bern" },
    koeniz: { lat: 46.9244, lon: 7.4146, region: "Bern" },
    "biel-bienne": { lat: 47.1368, lon: 7.2468, region: "Bern" },
    schaffhausen: { lat: 47.6973, lon: 8.6349, region: "Schaffhausen" },
    "la-chaux-de-fonds": { lat: 47.1035, lon: 6.8328, region: "Neuenburg" },
    luzern: { lat: 47.0502, lon: 8.3093, region: "Luzern" },
    chur: { lat: 46.8508, lon: 9.532, region: "Graubünden" },
    zug: { lat: 47.1662, lon: 8.5155, region: "Zug" },
    aarau: { lat: 47.3925, lon: 8.0444, region: "Aargau" },
  },
};

/** WordPress-Slugs wie "singles-berlin" oder "rosenheim-singles" auf den Stadtschlüssel bringen. */
export function geoKey(slug: string) {
  return decodeURIComponent(slug)
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/^singles-/, "")
    .replace(/-singles$/, "");
}

export function cityGeo(market: MarketCode, slug: string): Geo | null {
  return GEO[market][geoKey(slug)] ?? null;
}

type CountryMap = {
  width: number;
  height: number;
  path: string;
  projection: { k: number; minX: number; minY: number; scale: number; pad: number };
};

export type MapPin = { key: string; name: string; href: string; previewHref?: string; x: number; y: number; label: { x: number; y: number; anchor: "start" | "end" | "middle" } | null };

type Box = { x1: number; y1: number; x2: number; y2: number };
const overlaps = (a: Box, b: Box) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

/** Städte auf den Landesumriss projizieren und Beschriftungen ohne Überlappung platzieren. */
export function buildMap(market: MarketCode, cities: { key: string; slug: string; name: string; href: string; previewHref?: string }[]) {
  const map = (maps as Record<string, CountryMap>)[market];
  const { k, minX, minY, scale, pad } = map.projection;
  const size = market === "ch" ? 30 : 36;
  const points = cities
    .map((city) => ({ city, geo: cityGeo(market, city.slug) }))
    .filter((entry): entry is { city: typeof cities[number]; geo: Geo } => Boolean(entry.geo))
    .map(({ city, geo }) => ({ ...city, x: Math.round((geo.lon * k - minX) * scale + pad), y: Math.round((-geo.lat - minY) * scale + pad) }));
  const pinBoxes: Box[] = points.map((p) => ({ x1: p.x - 20, y1: p.y - 20, x2: p.x + 20, y2: p.y + 20 }));
  const placed: Box[] = [];
  const pins: MapPin[] = points.map((p) => {
    const w = p.name.length * size * 0.56;
    const h = size;
    const options: { box: Box; label: NonNullable<MapPin["label"]> }[] = [
      { box: { x1: p.x + 24, y1: p.y - h / 2, x2: p.x + 24 + w, y2: p.y + h / 2 }, label: { x: p.x + 24, y: p.y + 12, anchor: "start" } },
      { box: { x1: p.x - 24 - w, y1: p.y - h / 2, x2: p.x - 24, y2: p.y + h / 2 }, label: { x: p.x - 24, y: p.y + 12, anchor: "end" } },
      { box: { x1: p.x - w / 2, y1: p.y - 20 - h, x2: p.x + w / 2, y2: p.y - 20 }, label: { x: p.x, y: p.y - 26, anchor: "middle" } },
      { box: { x1: p.x - w / 2, y1: p.y + 20, x2: p.x + w / 2, y2: p.y + 20 + h }, label: { x: p.x, y: p.y + 48, anchor: "middle" } },
    ];
    const fit = options.find(({ box }) =>
      box.x1 >= -10 && box.x2 <= map.width + 10 && box.y1 >= -10 && box.y2 <= map.height + 10
      && !placed.some((other) => overlaps(box, other))
      && !pinBoxes.some((pin, index) => points[index].key !== p.key && overlaps(box, pin)));
    if (fit) placed.push(fit.box);
    return { key: p.key, name: p.name, href: p.href, previewHref: p.previewHref, x: p.x, y: p.y, label: fit?.label ?? null };
  });
  return { width: map.width, height: map.height, path: map.path, pins, labelSize: size };
}
