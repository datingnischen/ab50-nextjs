import inventory from "@/data/ch-partnersuche.json";

export type SwissCity = (typeof inventory.cities)[number];

export const swissPartnersuche = inventory;

export function getSwissCity(slug: string) {
  return inventory.cities.find((city) => city.slug === slug) || null;
}

export function getSwissCitySlugs() {
  return inventory.cities.map((city) => city.slug);
}

export function swissCityPath(slug: string) {
  return `/partnersuche/${slug}`;
}
