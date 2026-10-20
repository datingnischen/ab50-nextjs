import inventory from "../data/ch-partnersuche.json" with { type: "json" };

import { publicMarketUrl } from "./markets.ts";

/**
 * CH-Knoten der WordPress-kompatiblen Schnittstelle (https://ab50.ch/magazin/wp-json/wp/v2/posts).
 *
 * Hintergrund (Heiko, 2026-10-19): Die ab50.ch-Startseite von ICONY holte ihre drei Magazin-Teaser von ab50.de. Die
 * Bilder kamen dann von ab50.de, die CSP der ICONY-Startseite (`img-src 'self'`) blockte sie, und die Links führten
 * ins .de-Magazin. Ein Schweizer Magazin gibt es nicht. Darum liefert der Länderknoten die drei größten Städteseiten
 * der Schweiz als „Beiträge“: Link, Bild und Text auf ab50.ch.
 *
 * nginx ruft Vercel für ab50.ch mit Pfadpräfix /ch auf (/ch/magazin/wp-json/…, /ch/magazin/?rest_route=…); proxy.ts
 * schreibt auf den internen Pfad /magazin/wp-json-ch/… um (eigener CDN-Cache-Schlüssel, von außen nicht erreichbar).
 *
 * Die Bilder sind die Stadtgrafiken der Stadtseiten (ICONY-CMS), als Kopie in public/city-images/ch/, damit die
 * Teaserbild-Route (lib/teaser-image.ts) sie vom eigenen Asset-Host ausliefert.
 */

export type MarketTeaserCode = "ch";

type Json = Record<string, any>;

// Größte Städte nach Einwohnern; Bildmaße der Dateien in public/city-images/<land>/.
const TEASER_CITIES: Record<MarketTeaserCode, { slug: string; width: number; height: number; bytes: number }[]> = {
  ch: [
    { slug: "zuerich", width: 1000, height: 563, bytes: 141521 },
    { slug: "genf", width: 1000, height: 563, bytes: 127657 },
    { slug: "basel", width: 1000, height: 563, bytes: 141802 },
  ],
};

// Feste Datumswerte: Reihenfolge = Einwohnerzahl (neuester „Beitrag“ zuerst).
const DATES = ["2026-10-20T12:00:00", "2026-10-20T11:00:00", "2026-10-20T10:00:00"];
const DATES_GMT = ["2026-10-20T10:00:00", "2026-10-20T09:00:00", "2026-10-20T08:00:00"];
const ID_BASE: Record<MarketTeaserCode, number> = { ch: 920_000 };
const MEDIA_ID_OFFSET = 1_000_000;

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildPosts(market: MarketTeaserCode): Json[] {
  return TEASER_CITIES[market].map((teaser, index) => {
    const city = inventory.cities.find((row) => row.slug === teaser.slug);
    if (!city) throw new Error(`Stadt ${market}/${teaser.slug} fehlt in data/ch-partnersuche.json`);
    const id = ID_BASE[market] + index + 1;
    const link = publicMarketUrl(market, `/partnersuche/${teaser.slug}/`);
    const excerpt = `<p>${escapeHtml(city.description)}</p>\n`;
    const alt = `Infografik: Partnersuche ab 50 in ${city.name}`;
    return {
      id,
      date: DATES[index],
      date_gmt: DATES_GMT[index],
      modified: DATES[index],
      modified_gmt: DATES_GMT[index],
      guid: { rendered: link },
      slug: teaser.slug,
      status: "publish",
      type: "post",
      link,
      title: { rendered: escapeHtml(city.title) },
      content: { rendered: excerpt, protected: false },
      excerpt: { rendered: excerpt, protected: false },
      author: 2,
      featured_media: MEDIA_ID_OFFSET + id,
      comment_status: "closed",
      ping_status: "closed",
      sticky: false,
      template: "",
      format: "standard",
      categories: [],
      tags: [],
      _embedded: {
        "wp:featuredmedia": [
          {
            id: MEDIA_ID_OFFSET + id,
            date: DATES[index],
            slug: `${market}-${teaser.slug}`,
            type: "attachment",
            title: { rendered: alt },
            alt_text: alt,
            media_type: "image",
            mime_type: "image/jpeg",
            // Asset-Pfad; wp-rest-compat macht daraus die Teaserbild-Adresse auf der Landesdomain.
            source_url: `/city-images/${market}/${teaser.slug}.jpg`,
            media_details: { width: teaser.width, height: teaser.height, filesize: teaser.bytes },
          },
        ],
      },
    };
  });
}

const cached = new Map<MarketTeaserCode, Json[]>();

export function loadMarketTeaserPosts(market: MarketTeaserCode): Json[] {
  const hit = cached.get(market);
  if (hit) return hit;
  const posts = buildPosts(market);
  cached.set(market, posts);
  return posts;
}
