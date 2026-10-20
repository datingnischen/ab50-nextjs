import rawInventory from "@/data/ch-partnersuche.json";
import { staticAsset } from "@/lib/static-asset";

/**
 * Stadt- und Übersichtsbilder liegen im Repo unter public/city-images/ch/ (Regel 2026-10-20: keine Bilder zur
 * Laufzeit aus dem ICONY-CMS). Die Daten speichern Pfade; ausgeliefert werden sie absolut vom Asset-Host, weil der
 * nginx vor ab50.ch nur Seitenrouten an Vercel weiterreicht. `sourceImageUrl` ist reine Herkunftsangabe.
 */
const LOCAL_IMAGE_SRC = /(\ssrc=")(\/city-images\/[^"]+)"/g;

function localizeHero<T extends { url: string }>(image: T): T {
  return { ...image, url: staticAsset(image.url) };
}

function localizeHtml(html: string) {
  return html.replace(LOCAL_IMAGE_SRC, (_match, prefix: string, path: string) => `${prefix}${staticAsset(path)}"`);
}

const inventory = {
  ...rawInventory,
  overview: {
    ...rawInventory.overview,
    heroImage: localizeHero(rawInventory.overview.heroImage),
    contentHtml: localizeHtml(rawInventory.overview.contentHtml),
  },
  cities: rawInventory.cities.map((city) => ({
    ...city,
    heroImage: localizeHero(city.heroImage),
    contentHtml: localizeHtml(city.contentHtml),
  })),
};

export type SwissCity = (typeof inventory.cities)[number];

export const swissPartnersuche = inventory;

export function getSwissCity(slug: string) {
  return inventory.cities.find((city) => city.slug === slug) || null;
}

export function getSwissCitySlugs() {
  return inventory.cities.map((city) => city.slug);
}

export function swissCityPath(slug: string) {
  return `/partnersuche/${slug}/`;
}
