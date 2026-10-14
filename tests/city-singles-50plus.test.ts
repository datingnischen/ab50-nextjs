import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { citySingleHouseholds, getSingles50PlusEstimate, shareAb50 } from "../lib/city-singles-50plus.ts";

test("Anteil der Alleinlebenden ab 50 liegt plausibel zwischen 50 und 65 Prozent", () => {
  for (const region of ["west", "ost"] as const) {
    const share = shareAb50(region);
    assert.ok(share > 0.5 && share < 0.65, `${region}: ${share}`);
  }
});

test("Leipzig bekommt eine gerundete Schaetzung mit Mikrozensus-Quelle", () => {
  const estimate = getSingles50PlusEstimate("singles-leipzig");
  assert.ok(estimate);
  assert.equal(estimate.estimate % 1000, 0);
  assert.ok(estimate.estimate > 100000 && estimate.estimate < 140000);
  assert.match(estimate.description, /Mikrozensus 2025/);
  assert.ok(estimate.sources.some((source) => source.url?.includes("destatis.de")));
});

test("Jede Stadt mit Kennzahlen hat eine Singlehaushalte-50+-Schaetzung", () => {
  const cities = JSON.parse(readFileSync("data/wp/stadt.json", "utf8")) as Array<{ slug: string; acf?: { local_stat_cards?: unknown[] } }>;
  for (const city of cities) {
    if (!city.acf?.local_stat_cards?.length) continue;
    assert.ok(citySingleHouseholds[city.slug], `fehlt: ${city.slug}`);
  }
});

test("Stadtseite blendet Studierende aus und zeigt Singlehaushalte ab 50", () => {
  const source = readFileSync("components/de-partnersuche-city.tsx", "utf8");
  assert.match(source, /withSingles50PlusCard\(normalizeStatCards\(city\.acf\?\.local_stat_cards\), singles50Plus\)/);
  assert.match(source, /!\/studier\|student\/i\.test/);
  assert.match(source, /label: "Singlehaushalte ab 50"/);
});
