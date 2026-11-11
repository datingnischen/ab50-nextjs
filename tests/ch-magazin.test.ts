import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import swissMagazine from "../data/ch-magazin.json" with { type: "json" };
import germanPosts from "../data/wp/posts.json" with { type: "json" };
import germanPages from "../data/wp/pages.json" with { type: "json" };
import inventory from "../data/ch-partnersuche.json" with { type: "json" };
import { chCityFacts, getChFlirtRank } from "../data/ch-city-facts.ts";
import { TITLE_MAX_WIDTH, titleWidth } from "../lib/seo-title.ts";

// Eigener ab50.ch-Beitrag „Die 10 besten Städte für Singles ab 50 in der Schweiz“ (2026-11-10).
const SLUG = "top-10-staedte-singles-ab-50-schweiz";
const post = swissMagazine.find((entry) => entry.slug === SLUG)!;
const html = post.content.rendered;
const plain = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const nameOf = (slug: string) => inventory.cities.find((city) => city.slug === slug)!.name;

const ranking = Object.entries(chCityFacts)
  .map(([slug, facts]) => ({ slug, name: nameOf(slug), facts }))
  .sort((a, b) => b.facts.flirtFaktor - a.facts.flirtFaktor);
const top10 = ranking.slice(0, 10);

test("Schweizer Beitrag liegt nur in data/ch-magazin.json, nicht im deutschen Bestand", () => {
  assert.ok(post, "Beitrag fehlt");
  for (const entry of swissMagazine) {
    assert.ok(!germanPosts.some((item: { slug: string }) => item.slug === entry.slug), `Slug auch in DE-Beiträgen: ${entry.slug}`);
    assert.ok(!germanPages.some((item: { slug: string }) => item.slug === entry.slug), `Slug auch in DE-Seiten: ${entry.slug}`);
  }
  assert.equal(post.date.slice(0, 10), "2026-11-10");
  assert.equal(post.author, 3);
  assert.equal(post.link, `https://ab50.ch/magazin/${SLUG}/`);
});

test("Rangliste im Beitrag entspricht chCityFacts (Top 10 nach Flirt-Faktor absteigend)", () => {
  assert.ok(ranking[9].facts.flirtFaktor > ranking[10].facts.flirtFaktor, "Platz 10 und 11 gleichauf – Top 10 nicht eindeutig");
  const chart = [...html.matchAll(/<span class="mag-chart-label">([^<]+)<\/span><div class="mag-bar-track"><span class="mag-bar" style="width:(\d+)%"><\/span><span class="mag-bar-value">(\d+)<\/span>/g)]
    .map((match) => ({ name: match[1], width: Number(match[2]), value: Number(match[3]) }));
  assert.deepEqual(chart, top10.map((city) => ({ name: city.name, width: city.facts.flirtFaktor, value: city.facts.flirtFaktor })));

  const rows = [...html.matchAll(/<tr><td>(\d+)<\/td><td>([^<]+)<\/td><td>(\d+)<\/td><td>([^<]+)<\/td>/g)];
  assert.equal(rows.length, 10);
  rows.forEach((row, index) => {
    const city = top10[index];
    const rank = ranking.findIndex((item) => item.facts.flirtFaktor === city.facts.flirtFaktor) + 1;
    assert.equal(Number(row[1]), rank, `Platz ${city.name}`);
    assert.equal(row[2], city.name);
    assert.equal(Number(row[3]), city.facts.flirtFaktor);
    assert.ok(row[4].startsWith(city.facts.einwohner), `Einwohner ${city.name}: ${row[4]}`);
  });

  // Porträts: Überschrift mit Platz und Punkten, die drei Treffpunkte aus den Stadtfakten, Link auf die CH-Stadtseite.
  const sections = html.split(/<h3>/).slice(1).filter((part) => /^\d+\. /.test(part));
  assert.equal(sections.length, 10);
  sections.forEach((section, index) => {
    const city = top10[index];
    const rank = ranking.findIndex((item) => item.facts.flirtFaktor === city.facts.flirtFaktor) + 1;
    assert.ok(section.startsWith(`${rank}. ${city.name}: ${city.facts.flirtFaktor} Punkte</h3>`), `Porträt ${city.name}`);
    const places = [...section.matchAll(/<li><strong>([^<]+):<\/strong>/g)].map((match) => match[1]);
    assert.deepEqual([...places].sort(), city.facts.treffpunkte.map((place) => place.name).sort(), `Treffpunkte ${city.name}`);
    assert.match(section, new RegExp(`<a href="/partnersuche/${city.slug}/">`));
  });

  // „Knapp hinter den Top 10“ und Gesamtzahl der bewerteten Städte.
  const next = ranking.filter((city) => city.facts.flirtFaktor === ranking[10].facts.flirtFaktor).map((city) => city.name);
  for (const name of next) assert.match(html, new RegExp(`${name}[^<]*je ${ranking[10].facts.flirtFaktor} Punkten|${name}`));
  assert.match(html, new RegExp(`je ${ranking[10].facts.flirtFaktor} Punkten`));
  const total = Object.keys(chCityFacts).length;
  assert.equal(total, inventory.cities.length);
  assert.match(html, new RegExp(`Alle ${total} bewerteten Städte`));
  assert.match(html, new RegExp(`haben wir ${total} Schweizer Städte`));
  assert.match(html, new RegExp(`<strong class="mag-stat-value">${top10[0].facts.flirtFaktor}</strong>`));
});

test("Titel, Description und Links des Schweizer Beitrags", () => {
  const title = post.title.rendered;
  assert.ok(titleWidth(`${title} | ab50.ch`) <= TITLE_MAX_WIDTH, "Titel zu breit");
  const description = plain(post.excerpt.rendered);
  assert.ok(description.length >= 110 && description.length <= 155, `Description ${description.length} Zeichen`);
  const body = [...html.matchAll(/<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)>/g)].map((match) => plain(match[1])).join(" ").toLowerCase();
  for (const word of title.match(/[\p{L}\d]+/gu)!.filter((word) => word.length > 2)) {
    assert.ok(new RegExp(`(?<![\p{L}\d])${word.toLowerCase()}(?![\p{L}\d])`, "u").test(body), `Titelwort fehlt im Text: ${word}`);
  }
  assert.doesNotMatch(html + description, /ß/);
  assert.doesNotMatch(html, /ab50\.de/);
  for (const match of html.matchAll(/href="\/partnersuche\/([^"]*)"/g)) {
    const slug = match[1].replace(/\/$/, "");
    assert.ok(slug === "" || inventory.cities.some((city) => city.slug === slug), `Kein CH-Stadtlink: ${match[1]}`);
  }
});

test("Schweizer Beitrag: eigene Route mit Self-Canonical, CH-Sitemap, Übersichten, kein Auftritt auf ab50.de", () => {
  const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");
  const chRoute = read("../app/ch/magazin/[slug]/page.tsx");
  assert.match(chRoute, /getSwissPostBySlug\(slug\)/);
  assert.match(chRoute, /market: "ch"/);
  const page = read("../app/magazin/[slug]/page.tsx");
  assert.match(page, /alternates: \{ canonical: url \}/);
  assert.match(page, /robots: \{ index: true, follow: true \}/);
  assert.match(page, /const url = swissPostUrl\(post\.slug\)/);
  assert.match(read("../app/ch/sitemap.xml/route.ts"), /swissPostUrl\(slug\)/);
  assert.match(read("../app/ch/magazin/page.tsx"), /getSwissPosts\(\)/);
  assert.match(read("../app/ch/partnersuche/page.tsx"), new RegExp(`/magazin/${SLUG}/`));
  // Deutsche Listen, Sitemap, REST und Suche lesen nur data/wp/posts.json.
  const wordpress = read("../lib/wordpress.ts");
  assert.match(wordpress, /const rawPosts = \(postsData as any\[\]\)/);
  assert.doesNotMatch(wordpress, /rawPosts[^\n]*swissMagazineData/);
  for (const file of ["../app/sitemap.ts", "../app/magazin/sitemap.xml/route.ts", "../app/magazin/page.tsx", "../app/ueber-uns/suche/page.tsx", "../lib/wp-rest-compat.ts"]) {
    assert.doesNotMatch(read(file), /getSwissPost|ch-magazin/, file);
  }
});

test("Rahmen (Kopf, Fuss, Anmeldung) zeigt bei eigenen ab50.ch-Beiträgen den Schweizer Markt", async () => {
  const { SWISS_MAGAZINE_SLUGS, marketFromPathname } = await import("../lib/markets.ts");
  assert.deepEqual([...SWISS_MAGAZINE_SLUGS].sort(), swissMagazine.map((entry) => entry.slug).sort());
  assert.equal(marketFromPathname(`/ch/magazin/${SLUG}/`), "ch");
  assert.equal(marketFromPathname("/ch/magazin/online-dating/"), "de");
  assert.equal(marketFromPathname(`/magazin/${SLUG}/`), "de");
});

test("Anmelde-Hinweise im Schweizer Beitrag zeigen auf ab50.ch", () => {
  const page = readFileSync(new URL("../app/magazin/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /sanitizeContent\(post\.content, tocItems, true, swiss \? "ch" : "de"\)/);
  assert.match(page, /<RadarCta market=\{swiss \? "ch" : "de"\} \/>/);
  assert.match(page, /<TopicBanner banner=\{banner\} placement="sidebar" market=\{swiss \? "ch" : "de"\} \/>/);
  assert.match(page, /const registration = market === "ch" \? registrationUrl\("ch", "magazin"\)/);
});

test("jede CH-Stadtseite nennt ihren Rangplatz und verlinkt die Rangliste", () => {
  assert.deepEqual(getChFlirtRank("zuerich"), { rank: 1, total: Object.keys(chCityFacts).length });
  assert.equal(getChFlirtRank("st-gallen")?.rank, 9);
  assert.equal(getChFlirtRank("biel-bienne")?.rank, 9);
  assert.equal(getChFlirtRank("thun")?.rank, 11);
  assert.equal(getChFlirtRank("gibt-es-nicht"), null);
  const page = readFileSync(new URL("../app/ch/partnersuche/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /getChFlirtRank\(city\.slug\)/);
  assert.match(page, /TOP10_PATH = "\/magazin\/top-10-staedte-singles-ab-50-schweiz\/"/);
});
