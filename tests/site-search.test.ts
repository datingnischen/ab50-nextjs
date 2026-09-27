import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolveHostRequest } from "../lib/market-router.ts";
import { SITE_SEARCH_PATH, normalizeSearchText, searchDocuments } from "../lib/site-search.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const exists = (path: string) => existsSync(new URL(path, import.meta.url));

test("site search lives next to Über uns, never on the ICONY-owned root /suche", () => {
  assert.equal(SITE_SEARCH_PATH, "/ueber-uns/suche/");
  assert.ok(exists("../app/ueber-uns/suche/page.tsx"));
  assert.ok(!exists("../app/suche"));
  assert.ok(!exists("../app/de/suche"));
  assert.ok(!exists("../app/ch/suche"));
  assert.ok(!exists("../app/themensuche"));
});

test("site search page is noindex,follow with a query-free canonical", () => {
  const page = read("../app/ueber-uns/suche/page.tsx");
  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.match(page, /canonical:\s*SITE_SEARCH_PATH/);
});

test("site search is not listed in the sitemap and not a generated Über-uns slug", () => {
  assert.doesNotMatch(read("../app/sitemap.ts"), /ueber-uns\/suche|SITE_SEARCH/);
  assert.doesNotMatch(read("../app/ueber-uns/[slug]/page.tsx"), /slug:\s*"suche"/);
});

test("site search is linked from the header menu and the Über-uns hub", () => {
  assert.match(read("../components/site-shell.tsx"), /<SiteSearchForm compact/);
  assert.match(read("../app/ueber-uns/page.tsx"), /<SiteSearchForm /);
  assert.match(read("../components/site-search-form.tsx"), /action=\{SITE_SEARCH_PATH\}[^>]*method="get"/);
});

test("the DE host passes the search route, the CH host keeps it closed", () => {
  assert.deepEqual(resolveHostRequest("ab50.de", "/ueber-uns/suche/"), { action: "pass", market: "de" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/ueber-uns/suche/"), { action: "not-found" });
});

test("normalization folds case, umlauts and diacritics", () => {
  assert.equal(normalizeSearchText("Köln"), normalizeSearchText("koeln"));
  assert.equal(normalizeSearchText("Straße"), "strasse");
  assert.equal(normalizeSearchText("Genève"), "geneve");
  assert.equal(normalizeSearchText("  Über-uns!  "), "ueber uns");
});

test("title hits rank before excerpt hits and all terms are required", () => {
  const docs = [
    { area: "Magazin", title: "Sicher daten", excerpt: "Tipps für dein Profil", href: "/magazin/a/" },
    { area: "Magazin", title: "Das perfekte Profil ab 50", excerpt: "So schreibst du es", href: "/magazin/b/" },
    { area: "Stadt", title: "Singles ab 50 aus München", excerpt: "Isar", href: "/partnersuche/singles-muenchen/" },
  ];
  assert.deepEqual(searchDocuments(docs, "profil").map((d) => d.href), ["/magazin/b/", "/magazin/a/"]);
  assert.deepEqual(searchDocuments(docs, "muenchen").map((d) => d.href), ["/partnersuche/singles-muenchen/"]);
  assert.deepEqual(searchDocuments(docs, "profil isar"), []);
  assert.deepEqual(searchDocuments(docs, "   "), []);
  assert.equal(searchDocuments(Array.from({ length: 80 }, (_, i) => ({ ...docs[1], href: `/x/${i}/` })), "profil").length, 50);
});
