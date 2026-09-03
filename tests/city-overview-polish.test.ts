import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../data/ch-partnersuche.json" with { type: "json" };
import { cityCardCopy, germanCityCardSlugs } from "../lib/city-card-copy.ts";
import { readFileSync } from "node:fs";

const deOverview = readFileSync(new URL("../components/de-partnersuche-overview.tsx", import.meta.url), "utf8");
const chOverview = readFileSync(new URL("../app/ch/partnersuche/page.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const wordpressSource = readFileSync(new URL("../lib/wordpress.ts", import.meta.url), "utf8");

const legacyPhrases = /\bSie\b|Lesen Sie|Finden Sie|Hier können Sie|Flirtfaktor|Match-Basis|ruhige Dates|Stadtbasis|Dating-Basis/;

for (const market of ["de", "ch"] as const) {
  test(`${market.toUpperCase()} city-card copy is complete, local, and consistently uses Du`, () => {
    const slugs = market === "de" ? germanCityCardSlugs : inventory.cities.map((city) => city.slug);
    assert.equal(slugs.length, 18);

    for (const slug of slugs) {
      const copy = cityCardCopy(market, slug);
      assert.ok(copy, `missing ${market} copy for ${slug}`);
      assert.ok(copy.length >= 70 && copy.length <= 180, `${market}/${slug} has unsuitable length`);
      assert.doesNotMatch(copy, legacyPhrases, `${market}/${slug} contains legacy phrasing`);
    }
  });
}

test("DE and CH overviews render editorial card copy and button-style CTAs", () => {
  assert.match(deOverview, /cityCardCopy\("de", city\.slug\)/);
  assert.match(chOverview, /cityCardCopy\("ch", city\.slug\)/);
  assert.match(deOverview, /className="post-card city-overview-card"/);
  assert.match(chOverview, /className="post-card city-overview-card"/);
  assert.match(deOverview, /card-read-more city-card-button/);
  assert.match(chOverview, /card-read-more city-card-button/);
  assert.match(deOverview, /href=\{siteConfig\.links\.registrationLocation\}/);
});

test("city-card layout keeps CTA buttons aligned at the bottom", () => {
  assert.match(css, /\.city-overview-card\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(css, /\.city-overview-card \.post-card-body\s*\{[^}]*display:\s*flex[^}]*flex:\s*1[^}]*flex-direction:\s*column/s);
  assert.match(css, /\.city-overview-card \.city-card-button\s*\{[^}]*margin-top:\s*auto/s);
});

test("DE public city slugs come from the city URL sitemap instead of the sitemap index", () => {
  assert.match(wordpressSource, /partner_sitemap\.php/);
});
