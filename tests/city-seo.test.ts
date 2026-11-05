import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TITLE_MAX_WIDTH, TITLE_SUFFIX, seoTitle, titleWidth } from "../lib/seo-title.ts";

type Seo = Record<string, { metaTitle: string; description: string }>;
const seo = JSON.parse(readFileSync(new URL("../data/city-seo.json", import.meta.url), "utf8")) as Seo;
const cities = JSON.parse(readFileSync(new URL("../data/wp/stadt.json", import.meta.url), "utf8")) as Array<{ slug: string; acf?: { city_name?: string } }>;

test("every German city page has an individual meta title and description", () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const templates = new Set<string>();
  for (const city of cities) {
    const entry = seo[city.slug];
    assert.ok(entry, `SEO-Eintrag fehlt: ${city.slug}`);
    const name = city.acf?.city_name ?? "";
    assert.ok(entry.metaTitle.includes(name), `Stadtname fehlt im Titel: ${city.slug}`);
    assert.ok(entry.metaTitle.length <= 61, `Titel zu lang: ${entry.metaTitle}`);
    const rendered = seoTitle(entry.metaTitle);
    const width = typeof rendered === "string" ? titleWidth(`${rendered}${TITLE_SUFFIX}`) : titleWidth(String((rendered as { absolute: string }).absolute));
    assert.ok(width <= TITLE_MAX_WIDTH, `Titel zu breit (${width}px): ${entry.metaTitle}`);
    assert.ok(entry.description.length >= 110 && entry.description.length <= 155, `Description ${entry.description.length} Zeichen: ${city.slug}`);
    titles.add(entry.metaTitle);
    descriptions.add(entry.description);
    templates.add(entry.metaTitle.split(name).join("X"));
  }
  assert.equal(titles.size, cities.length);
  assert.equal(descriptions.size, cities.length);
  assert.equal(templates.size, cities.length, "Titel unterscheiden sich nur im Stadtnamen");
});
