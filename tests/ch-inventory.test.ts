import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../data/ch-partnersuche.json" with { type: "json" };

const expectedSlugs = [
  "zuerich",
  "genf",
  "basel",
  "bern",
  "lausanne",
  "winterthur",
  "st-gallen",
  "lugano",
  "fribourg",
  "thun",
  "koeniz",
  "biel-bienne",
  "schaffhausen",
  "la-chaux-de-fonds",
  "luzern",
  "chur",
  "zug",
  "aarau",
];

test("Swiss city inventory matches the complete live overview", () => {
  assert.deepEqual(inventory.cities.map((city) => city.slug), expectedSlugs);
  assert.equal(new Set(inventory.cities.map((city) => city.slug)).size, expectedSlugs.length);
});

test("Swiss overview preserves hub editorial media and source provenance", () => {
  assert.equal(inventory.overview.sourceUrl, "https://ab50.ch/schweiz/");
  assert.match(inventory.overview.heroImage.url, /^https:\/\/static-cms\.icony-hosting\.de\//);
  assert.ok(inventory.overview.contentHtml.length > 1500);
});

test("every Swiss city is complete, sanitized, and market-routable", () => {
  for (const city of inventory.cities) {
    assert.ok(city.name);
    assert.ok(city.title);
    assert.ok(city.description.length > 50);
    assert.ok(city.contentHtml.length > 1500);
    assert.match(city.sourceUrl, /^https:\/\/ab50\.ch\/singles\//);
    assert.match(city.heroImage.url, /^https:\/\/static-cms\.icony-hosting\.de\//);
    assert.doesNotMatch(city.contentHtml, /<(?:form|iframe|script)\b/i);
    assert.doesNotMatch(city.contentHtml, /cdn3\.icony-hosting\.de\/user-media/i);
    assert.doesNotMatch(city.contentHtml, /<h[1-6][^>]*>\s*<\/h[1-6]>/i);
    assert.doesNotMatch(city.contentHtml, /https:\/\/ab50\.ch\/singles\//i);
    assert.match(city.contentHtml, /\/partnersuche\//);
  }
});
