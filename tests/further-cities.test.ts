import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pickFurtherCities } from "../lib/further-cities.ts";

const cities = ["/p/a", "/p/b", "/p/c", "/p/d", "/p/e", "/p/f", "/p/g", "/p/h"].map((path) => ({ path, hasImage: true }));

test("further cities rotate after the current city and wrap around", () => {
  assert.deepEqual(pickFurtherCities(cities, "/p/f").map((city) => city.path), ["/p/g", "/p/h", "/p/a", "/p/b", "/p/c", "/p/d"]);
  assert.deepEqual(pickFurtherCities([...cities].reverse(), "/p/a").map((city) => city.path), ["/p/b", "/p/c", "/p/d", "/p/e", "/p/f", "/p/g"]);
});

test("further cities never include the current city and prefer cities with an image", () => {
  const mixed = cities.map((city) => ({ ...city, hasImage: city.path !== "/p/c" }));
  const picked = pickFurtherCities(mixed, "/p/a").map((city) => city.path);
  assert.equal(picked.length, 6);
  assert.ok(!picked.includes("/p/a"));
  assert.ok(!picked.includes("/p/c"));
});

test("DE and CH city pages render the further-cities block", () => {
  const de = readFileSync(new URL("../components/de-partnersuche-city.tsx", import.meta.url), "utf8");
  const ch = readFileSync(new URL("../app/ch/partnersuche/[slug]/page.tsx", import.meta.url), "utf8");
  for (const source of [de, ch]) {
    assert.match(source, /<CityFurtherCities/);
    assert.match(source, /pickFurtherCities\(/);
  }
});
