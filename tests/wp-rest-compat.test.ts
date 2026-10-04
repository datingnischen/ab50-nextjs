import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { handleWpRest } from "../lib/wp-rest-compat.ts";

test("posts-Endpunkt liefert Beiträge im WordPress-Format mit Gesamtzahl", () => {
  const result = handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=3&_embed=1"));
  assert.equal(result.status, 200);
  const rows = result.body as any[];
  assert.equal(rows.length, 3);
  assert.equal(result.headers["X-WP-Total"], "66");
  assert.ok(rows[0].title.rendered && rows[0].slug && rows[0].link);
  assert.ok(rows[0]._embedded, "_embed liefert Beitragsbild und Kategorien");
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
