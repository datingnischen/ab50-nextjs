import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import inventory from "../data/ch-partnersuche.json" with { type: "json" };
import { germanCityCardSlugs } from "../lib/city-card-copy.ts";
import { getIconyWidgetLocationForRoute } from "../data/city-widget-locations.ts";
import {
  citySearchPostcodes,
  citySearchUrl,
  getCitySearchPostcode,
} from "../lib/city-search.ts";

const deRenderer = readFileSync(new URL("../components/de-partnersuche-city.tsx", import.meta.url), "utf8");
const chRenderer = readFileSync(new URL("../app/ch/partnersuche/[slug]/page.tsx", import.meta.url), "utf8");
const widgetLocations = readFileSync(new URL("../data/city-widget-locations.ts", import.meta.url), "utf8");

const expectedGermanSlugs = [
  "singles-hannover",
  "singles-berlin",
  "singles-koeln",
  "singles-hamburg",
  "singles-frankfurt-am-main",
  "singles-muenchen",
  "singles-leipzig",
  "singles-kassel",
  "rosenheim-singles",
  "singles-freiburg",
  "singles-dortmund",
  "singles-duesseldorf",
  "singles-stuttgart",
  "singles-dresden",
  "singles-nuernberg",
  "singles-bremen",
  "singles-suhl",
  "singles-jena",
];

const expectedPostcodes = {
  de: ["30159", "10117", "50667", "20095", "60311", "80331", "04109", "34117", "83022", "79098", "44135", "40213", "70173", "01067", "90402", "28195", "98527", "07743"],
  ch: ["8001", "1204", "4001", "3011", "1003", "8400", "9000", "6900", "1700", "3600", "3098", "2502", "8200", "2300", "6003", "7000", "6300", "5000"],
};

test("all 36 public city routes have one country-valid central postcode", () => {
  assert.deepEqual([...germanCityCardSlugs].sort(), [...expectedGermanSlugs].sort());
  assert.equal(Object.keys(citySearchPostcodes.de).length, 18);
  assert.equal(Object.keys(citySearchPostcodes.ch).length, 18);

  for (const slug of expectedGermanSlugs) {
    assert.match(getCitySearchPostcode("de", slug), /^\d{5}$/, `invalid DE postcode for ${slug}`);
  }
  for (const city of inventory.cities) {
    assert.match(getCitySearchPostcode("ch", city.slug), /^\d{4}$/, `invalid CH postcode for ${city.slug}`);
  }

  assert.deepEqual(expectedGermanSlugs.map((slug) => getCitySearchPostcode("de", slug)), expectedPostcodes.de);
  assert.deepEqual(inventory.cities.map((city) => getCitySearchPostcode("ch", city.slug)), expectedPostcodes.ch);
});

test("city search URLs use central postcode first and preserve location attribution", () => {
  assert.equal(citySearchUrl("de", "singles-berlin"), "https://ab50.de/suche/?plz=10117&AID=location");
  assert.equal(citySearchUrl("de", "singles-frankfurt-am-main"), "https://ab50.de/suche/?plz=60311&AID=location");
  assert.equal(citySearchUrl("de", "singles-münchen"), "https://ab50.de/suche/?plz=80331&AID=location");
  assert.equal(citySearchUrl("ch", "fribourg"), "https://ab50.ch/suche/?plz=1700&AID=location");
  assert.equal(citySearchUrl("ch", "zuerich"), "https://ab50.ch/suche/?plz=8001&AID=location");

  for (const market of ["de", "ch"] as const) {
    for (const slug of Object.keys(citySearchPostcodes[market])) {
      assert.match(citySearchUrl(market, slug), new RegExp(`^https://ab50\\.${market}/suche/\\?plz=\\d+&AID=location$`));
    }
  }
});

test("city search resolution fails closed for unknown or malformed route keys", () => {
  assert.throws(() => getCitySearchPostcode("de", "berlin"), /Missing central postcode/);
  assert.throws(() => getCitySearchPostcode("ch", "frankfurt-am-main"), /Missing central postcode/);
  assert.throws(() => getCitySearchPostcode("de", "%E0%A4%A"), /Invalid city route slug/);
});

test("route renderers build search URLs from route slugs, not display names or broad widget zips", () => {
  assert.match(deRenderer, /citySearchUrl\("de", slug\)/);
  assert.match(chRenderer, /citySearchUrl\("ch", city\.slug\)/);
  assert.doesNotMatch(deRenderer, /getIconyWidgetLocation\(cityName\)/);
  assert.doesNotMatch(chRenderer, /getIconyWidgetLocation\(city\.name, 41\)/);
  assert.match(widgetLocations, /zip:\s*"10,12,13,14"/);
});

test("route-aware widget lookup resolves DE prefixes and Swiss display-name aliases", () => {
  assert.deepEqual(getIconyWidgetLocationForRoute("singles-frankfurt-am-main", 49), { country: 49, zip: "60,65" });
  assert.deepEqual(getIconyWidgetLocationForRoute("singles-münchen", 49), { country: 49, zip: "80,81" });
  assert.deepEqual(getIconyWidgetLocationForRoute("fribourg", 41), { country: 41, zip: "17" });
});

test("registration links remain separate from postcode search links", () => {
  assert.match(deRenderer, /profileClickUrl=\{siteConfig\.links\.registrationLocation\}/);
  assert.match(chRenderer, /profileClickUrl=\{registration\}/);
  assert.match(chRenderer, /registrationUrl\("ch", "location"\)/);
});
