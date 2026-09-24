import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { searchUrl } from "../lib/markets.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const component = read("../components/city-search-fallback.tsx");
const overviews = {
  de: read("../components/de-partnersuche-overview.tsx"),
  ch: read("../app/ch/partnersuche/page.tsx"),
};

for (const [market, source] of Object.entries(overviews)) {
  test(`${market.toUpperCase()} city overview renders the individual-search fallback`, () => {
    assert.match(source, new RegExp(`<CitySearchFallback market="${market}" />`));
  });
}

test("individual-search fallback links absolutely to the live /suche/ page with AID=location", () => {
  assert.match(component, /href=\{searchUrl\(market\)\}/);
  assert.equal(searchUrl("de"), "https://ab50.de/suche/?AID=location");
  assert.equal(searchUrl("ch"), "https://ab50.ch/suche/?AID=location");
  assert.doesNotMatch(component, /vercel\.app/);
});
