import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { handleWpRest } from "../lib/wp-rest-compat.ts";
import { teaserImagePath } from "../lib/teaser-image.ts";

test("posts-Endpunkt liefert Beiträge im WordPress-Format mit Gesamtzahl", () => {
  const result = handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=3&_embed=1"));
  assert.equal(result.status, 200);
  const rows = result.body as any[];
  assert.equal(rows.length, 3);
  assert.equal(result.headers["X-WP-Total"], "67");
  assert.ok(rows[0].title.rendered && rows[0].slug && rows[0].link);
  assert.ok(rows[0]._embedded, "_embed liefert Beitragsbild und Kategorien");
  // ICONY liest media_details.sizes; der Snapshot hat nur source_url + Maße, also entsteht die Liste hier (Heiko, 2026-10-14)
  for (const row of rows) {
    const media = row._embedded["wp:featuredmedia"]?.[0];
    assert.ok(media, `${row.slug}: Beitragsbild`);
    assert.match(media.source_url, /^https:\/\/ab50\.de\/magazin\//, "eigene Domain (CSP der ICONY-Startseite)");
    // Snapshot-Größen bleiben, fehlende Listen bekommen medium/large/full aus source_url
    for (const name of ["full", "medium"]) {
      const size = media.media_details.sizes[name];
      assert.ok(size, `${row.slug}: Größe ${name}`);
      assert.match(size.source_url, /^https:\/\/ab50\.de\/magazin\//, `${row.slug}: ${name} auf eigener Domain`);
      assert.ok(size.width > 0, `${row.slug}: Breite ${name}`);
    }
    assert.match(media.mime_type, /^image\//);
  }
});

test("kein users-, pages- oder stadt-Endpunkt, keine Autoren im Embed", () => {
  for (const route of ["/wp/v2/users", "/wp/v2/pages", "/wp/v2/stadt"]) {
    assert.equal(handleWpRest(route, new URLSearchParams()).status, 404, route);
  }
  const rows = handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=100&_embed=1")).body as any[];
  for (const row of rows) assert.ok(!row._embedded?.author, "_embedded.author darf nicht erscheinen");
});

test("slug und _fields funktionieren", () => {
  const first = (handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=1")).body as any[])[0];
  const bySlug = handleWpRest("/wp/v2/posts", new URLSearchParams(`slug=${first.slug}&_fields=id,slug`)).body as any[];
  assert.deepEqual(Object.keys(bySlug[0]).sort(), ["id", "slug"]);
});

test("Anwendungscode ruft WordPress nicht mehr ab", () => {
  for (const file of ["lib/wordpress.ts", "components/sticky-cta-button.tsx", "data/site.ts"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.ok(!/wp-json\/wp\/v2|WORDPRESS_REST|wordpressRestEndpoint/.test(source), `${file} enthält einen WordPress-Abruf`);
  }
});

// Heiko (2026-10-19): ab50.ch-Startseite lädt Teaser künftig von https://ab50.ch/magazin/wp-json/… – drei größte
// Schweizer Städteseiten mit Link und Bild auf ab50.ch (lib/wp-market-teasers.ts).
test("CH-Knoten liefert Zürich, Genf, Basel mit Links und Bildern auf ab50.ch", () => {
  const result = handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=3&_embed"), "ch");
  assert.equal(result.status, 200);
  assert.equal(result.headers["X-WP-Total"], "3");
  const rows = result.body as any[];
  assert.deepEqual(rows.map((row) => row.slug), ["zuerich", "genf", "basel"]);
  for (const row of rows) {
    assert.equal(row.link, `https://ab50.ch/partnersuche/${row.slug}/`);
    assert.ok(row.title.rendered && row.excerpt.rendered && row.date);
    assert.ok(row.featured_media > 0);
    const media = row._embedded["wp:featuredmedia"][0];
    const expected = `https://ab50.ch/magazin/wp-json/datingnischen/v1/bild/city-images/ch/${row.slug}~jpg`;
    assert.equal(media.source_url, expected);
    assert.equal(media.media_details.sizes.medium_large.source_url, expected);
    assert.equal(media.media_details.sizes.medium_large.width, 1000);
    assert.equal(media.media_details.sizes.medium_large.height, 563);
    assert.equal(media.mime_type, "image/jpeg");
    const path = teaserImagePath(["datingnischen", "v1", "bild", "city-images", "ch", `${row.slug}~jpg`]);
    assert.equal(path, `/city-images/ch/${row.slug}.jpg`, "Teaserbild-Route gibt den Ordner frei");
    assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), `${path} liegt in public/`);
  }
  const root = handleWpRest("/", new URLSearchParams(), "ch").body as any;
  assert.equal(root.home, "https://ab50.ch");
  assert.deepEqual(handleWpRest("/wp/v2/categories", new URLSearchParams(), "ch").body, []);
});

test("ohne Markt bleibt ab50.de bei den Magazinbeiträgen", () => {
  const rows = handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=3&_embed=1")).body as any[];
  for (const row of rows) {
    assert.match(row.link, /^https:\/\/ab50\.de\/magazin\//);
    assert.match(row._embedded["wp:featuredmedia"][0].source_url, /^https:\/\/ab50\.de\/magazin\/wp-json\/datingnischen\/v1\/bild\//);
  }
});

test("proxy: CH-Knoten nur über das Pfadpräfix /ch, interner Pfad von außen gesperrt", () => {
  const source = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
  assert.ok(source.includes("destination.pathname = `/magazin/wp-json-ch${route}`"), "Rewrite auf den internen Pfad");
  assert.ok(source.includes('if (rest.market === "ch"'), "nur für den Markt ch");
  assert.ok(source.includes(String.raw`const CH_REST_INTERNAL = /^(?:\/(?:de|ch|at))?\/magazin\/wp-json-ch(?:\/|$)/;`), "direkter Aufruf = 404");
  assert.ok(source.includes(String.raw`searchParams.has("rest_route") && /^\/(?:de|ch|at)\/magazin(?:\/index\.php)?\/?$/`), "/ch/magazin/?rest_route=… wird erkannt");
  const route = readFileSync(new URL("../app/magazin/wp-json-ch/[[...route]]/route.ts", import.meta.url), "utf8");
  assert.match(route, /handleWpRest\(`\/\$\{route\.join\("\/"\)\}`, params, "ch"\)/);
  assert.match(route, /teaserImageResponse/);
});
