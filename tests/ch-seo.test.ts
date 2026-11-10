import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import inventory from "../data/ch-partnersuche.json" with { type: "json" };
import { TITLE_MAX_WIDTH, titleWidth } from "../lib/seo-title.ts";
import { mirrorRouteDestination } from "../lib/market-router.ts";
import { mirrorMetadata } from "../lib/mirror-metadata.ts";

// Seobility ab50.ch (Crawl 2026-11-10): Titel > 580 px, Descriptions zu lang/zu kurz, doppelte Fettungen und
// Überschriften, 98 Canonicals auf ab50.de, 404 durch relative Links auf deutsche Stadtseiten.

const CH_SUFFIX = " | ab50.ch";
const STOP = new Set(["und", "in", "der", "die", "das", "mit", "zu", "für", "von", "ein", "eine", "im", "am", "an", "auf", "den", "dem", "des", "oder", "aus", "ab"]);
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const words = (text: string) => (text.match(/[\p{L}\d]+/gu) ?? []).filter((word) => word.length > 1 && !STOP.has(word.toLowerCase()));

test("Schweizer Stadttitel bleiben mit „| ab50.ch“ unter der Seobility-Breite und sind individuell", () => {
  const titles = new Set<string>();
  const templates = new Set<string>();
  for (const city of inventory.cities) {
    const width = titleWidth(`${city.title}${CH_SUFFIX}`);
    assert.ok(width <= TITLE_MAX_WIDTH, `Titel zu breit (${Math.round(width)} px): ${city.title}`);
    // „Freiburg (Fribourg)“: eine der beiden Schreibweisen genügt.
    const names = city.name.replace(/\)$/, "").split(" (");
    assert.ok(names.some((name) => city.title.includes(name)), `Stadtname fehlt im Titel: ${city.slug}`);
    assert.doesNotMatch(city.title, /ß/, `Schweizer Schreibweise: ${city.slug}`);
    titles.add(city.title);
    templates.add(city.title.split(city.name).join("X"));
  }
  assert.equal(titles.size, inventory.cities.length);
  assert.equal(templates.size, inventory.cities.length, "Titel unterscheiden sich nur im Stadtnamen");
});

test("Schweizer Descriptions haben 110–155 Zeichen, Schweizer Schreibweise und tragen alle Titelwörter", () => {
  const descriptions = new Set<string>();
  for (const page of [inventory.overview, ...inventory.cities]) {
    const { description } = page;
    assert.ok(description.length >= 110 && description.length <= 155, `Description ${description.length} Zeichen: ${page.title}`);
    assert.doesNotMatch(description, /ß/, `Schweizer Schreibweise: ${page.title}`);
    assert.doesNotMatch(description, /Lesen Sie|Artikel um|Jetzt entdecken/, `Floskel in der Description: ${page.title}`);
    descriptions.add(description);
  }
  assert.equal(descriptions.size, inventory.cities.length + 1);
  // Titel = H1; die Description steht als Lead (<p>) im Hero, darum muss jedes Titelwort im Fliesstext vorkommen.
  for (const city of inventory.cities) {
    const body = ` ${city.description} ${plain(city.contentHtml)} `.toLowerCase();
    for (const word of words(city.title)) {
      assert.ok(new RegExp(`(?<![\\p{L}\\d])${word.toLowerCase()}(?![\\p{L}\\d])`, "u").test(body), `Titelwort „${word}“ fehlt im Text: ${city.slug}`);
    }
  }
});

test("Schweizer Stadttexte ohne doppelte oder überlange Fettungen und ohne doppelte Überschriften", () => {
  for (const page of [inventory.overview, ...inventory.cities]) {
    const strong = [...page.contentHtml.matchAll(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((match) => plain(match[2]).replace(/[\s–:-]+$/, ""));
    assert.equal(new Set(strong).size, strong.length, `Doppelte Fettung: ${page.title}`);
    for (const text of strong) assert.ok(text.length <= 70, `Fettung zu lang: ${text}`);
    const headings = [...page.contentHtml.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)].map((match) => plain(match[1]));
    assert.equal(new Set(headings).size, headings.length, `Doppelte Überschrift: ${page.title}`);
  }
});

test("ab50.ch-Spiegel von Magazin, FAQ und Über uns bekommt eigene Routen statt der deutschen Seite", () => {
  assert.equal(mirrorRouteDestination("/magazin/", "ch"), "/ch/magazin/");
  assert.equal(mirrorRouteDestination("/magazin/online-dating/", "ch"), "/ch/magazin/online-dating/");
  assert.equal(mirrorRouteDestination("/magazin/kategorie/leben/", "ch"), "/ch/magazin/kategorie/leben/");
  assert.equal(mirrorRouteDestination("/faq/", "ch"), "/ch/faq/");
  assert.equal(mirrorRouteDestination("/ueber-uns/suche/", "ch"), "/ch/ueber-uns/suche/");
  // Dateien und REST-Knoten bleiben beim gemeinsamen Ziel, andere Märkte unverändert.
  assert.equal(mirrorRouteDestination("/magazin/sitemap.xml", "ch"), "/magazin/sitemap.xml");
  assert.equal(mirrorRouteDestination("/magazin/wp-json/wp/v2/posts", "ch"), "/magazin/wp-json/wp/v2/posts");
  assert.equal(mirrorRouteDestination("/magazin/", "de"), "/magazin/");
  assert.equal(mirrorRouteDestination("/magazin/", "at"), "/magazin/");
  assert.equal(mirrorRouteDestination("/partnersuche/zuerich/", "ch"), "/partnersuche/zuerich/");

  const proxy = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
  assert.match(proxy, /mirrorRouteDestination\(resolution\.destination, resolution\.market\)/);
});

test("Spiegelseiten unter ab50.ch: kein Canonical auf ab50.de, noindex, follow", () => {
  const metadata = mirrorMetadata({
    title: "FAQ",
    alternates: { canonical: "/faq/", languages: { "de-DE": "https://ab50.de/faq/" } },
    openGraph: { title: "FAQ", url: "https://ab50.de/faq/" },
  });
  assert.equal(metadata.alternates?.canonical, null);
  assert.deepEqual(metadata.alternates?.languages, {});
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert.doesNotMatch(JSON.stringify(metadata), /ab50\.de/);

  const routes = ["magazin", "magazin/[slug]", "magazin/kategorie/[slug]", "faq", "ueber-uns", "ueber-uns/[slug]", "ueber-uns/suche"];
  for (const route of routes) {
    const file = new URL(`../app/ch/${route}/page.tsx`, import.meta.url);
    assert.ok(existsSync(file), `Spiegelroute fehlt: app/ch/${route}`);
    const source = readFileSync(file, "utf8");
    assert.match(source, /mirrorMetadata\(/, `noindex-Metadaten fehlen: app/ch/${route}`);
    assert.doesNotMatch(source, /canonical/, `Canonical in app/ch/${route}`);
  }
  // Eigene Schweizer Inhalte behalten ihr Self-Canonical.
  for (const route of ["partnersuche", "partnersuche/[slug]"]) {
    const source = readFileSync(new URL(`../app/ch/${route}/page.tsx`, import.meta.url), "utf8");
    assert.match(source, /canonical: (?:overviewPath|route)\.publicUrl/);
    assert.doesNotMatch(source, /mirrorMetadata/);
  }
});

test("Seiten, die auch unter ab50.ch laufen, verlinken deutsche Stadtseiten absolut auf ab50.de", () => {
  const notFound = readFileSync(new URL("../app/not-found.tsx", import.meta.url), "utf8");
  assert.match(notFound, /publicMarketUrl\("de", `\/partnersuche\//);
  assert.doesNotMatch(notFound, /href=\{`\/partnersuche\/\$\{/);
  const search = readFileSync(new URL("../app/ueber-uns/suche/page.tsx", import.meta.url), "utf8");
  assert.match(search, /href: publicMarketUrl\("de", cityPath\(publicSlug\)\)/);
  const magazine = readFileSync(new URL("../app/magazin/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(magazine, /href: cityUrl\(city\.slug\)/);
  assert.doesNotMatch(magazine, /href: cityPath\(/);
});

// Christian 2026-11-10: /partnersuche/singles-…/ sind deutsche Seiten und existieren auf ab50.ch nicht. Nichts, was
// unter ab50.ch ausgeliefert wird, darf sie relativ verlinken (nur absolut auf https://ab50.de/… oder gar nicht).
const RELATIVE_DE_CITY_LINK = /href(?:=|\\?":)\\?["']\/partnersuche\/singles-/;

test("Auf ab50.ch gerendertes HTML enthält keine relativen Links auf deutsche Stadtseiten", () => {
  const inventoryText = JSON.stringify(inventory);
  assert.doesNotMatch(inventoryText, RELATIVE_DE_CITY_LINK);
  for (const file of ["../data/wp/posts.json", "../data/wp/pages.json"]) {
    assert.doesNotMatch(readFileSync(new URL(file, import.meta.url), "utf8"), RELATIVE_DE_CITY_LINK, file);
  }
  // Quelltexte, die unter ab50.ch gerendert werden: keine relativen DE-Stadtpfade als Link.
  const sources = [
    "../app/not-found.tsx",
    "../app/ueber-uns/suche/page.tsx",
    "../app/magazin/[slug]/page.tsx",
    "../app/magazin/page.tsx",
    "../app/magazin/kategorie/[slug]/page.tsx",
    "../app/faq/page.tsx",
    "../app/ueber-uns/page.tsx",
    "../app/ch/partnersuche/page.tsx",
    "../app/ch/partnersuche/[slug]/page.tsx",
    "../components/site-shell.tsx",
  ];
  for (const file of sources) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /href(?:=\{|: )cityPath\(/, file);
    assert.doesNotMatch(source, /href=\{`\/partnersuche\/\$\{/, file);
    assert.doesNotMatch(source, /href="\/partnersuche\/singles-/, file);
  }
  // Nach einem Build zusätzlich das fertige HTML/RSC der CH-Routen und der gemeinsamen Seiten prüfen.
  const built = new URL("../.next/server/app/", import.meta.url);
  if (!existsSync(built)) return;
  const files: URL[] = [];
  const walk = (dir: URL) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const next = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) walk(next);
      else if (/\.(html|rsc)$/.test(entry.name)) files.push(next);
    }
  };
  for (const name of ["ch/", "magazin/", "_not-found/"]) if (existsSync(new URL(name, built))) walk(new URL(name, built));
  for (const name of ["_not-found.html", "_not-found.rsc", "faq.html", "magazin.html", "ueber-uns.html"]) {
    if (existsSync(new URL(name, built))) files.push(new URL(name, built));
  }
  assert.ok(files.length > 20, "Build-Ausgabe der CH-Routen nicht gefunden");
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, "utf8"), RELATIVE_DE_CITY_LINK, file.pathname);
  }
});
