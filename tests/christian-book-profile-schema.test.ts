import test from "node:test";
import assert from "node:assert/strict";
import { buildChristianBookProfileGraph } from "../lib/christian-book-profile-schema.ts";

const markerContent = `
<p>Profiltext</p>
<!-- dating-ohne-bullshit-book:start -->
<figure><img loading="lazy" data-src="https://ab50.de/magazin/wp-content/uploads/2026/08/dating-ohne-bullshit.jpg" src="data:image/svg+xml;base64,placeholder" alt="Dating ohne Bullshit"></figure>
<!-- dating-ohne-bullshit-book:end -->
`;

test("builds the Christian CMS-gated profile and book graph", () => {
  const canonicalUrl = "https://ab50.de/magazin/christian-m-haas";
  const graph = buildChristianBookProfileGraph({
    slug: "christian-m-haas",
    christianSlug: "christian-m-haas",
    content: markerContent,
    canonicalUrl,
    profileName: "Christian M. Haas",
    profileDescription: "Dating-Experte",
    breadcrumbRootName: "50plus Magazin",
    breadcrumbRootUrl: "https://ab50.de/magazin",
  });

  assert.ok(graph);
  assert.equal(graph["@context"], "https://schema.org");
  assert.deepEqual(graph["@graph"].map((node) => node["@type"]), ["BreadcrumbList", "ProfilePage", "Person", "Book"]);

  const profile = graph["@graph"][1] as { mainEntity: Record<string, unknown> };
  const person = graph["@graph"][2];
  const book = graph["@graph"][3] as { author: Record<string, unknown> } & Record<string, unknown>;
  assert.equal(profile.mainEntity["@id"], `${canonicalUrl}#person`);
  assert.equal(person["@id"], `${canonicalUrl}#person`);
  assert.equal(book.author["@id"], `${canonicalUrl}#person`);
  assert.equal(book.name, "Dating ohne Bullshit");
  assert.equal(book.alternateName, "Der ungeschönte Insiderblick ins Online-Dating-Business");
  assert.equal(book.isbn, "9783696371210");
  assert.equal(book.datePublished, "2026-08-21");
  assert.equal(book.inLanguage, "de-DE");
  assert.equal(book.bookFormat, "https://schema.org/Paperback");
  assert.equal(book.numberOfPages, 136);
  assert.equal(book.url, "https://www.amazon.de/dp/3696371211/");
  assert.equal(book.image, "https://ab50.de/magazin/wp-content/uploads/2026/08/dating-ohne-bullshit.jpg");
});

test("suppresses the graph outside the exact Christian CMS marker boundary", () => {
  const base = {
    christianSlug: "christian-m-haas",
    canonicalUrl: "https://ab50.de/magazin/christian-m-haas",
    profileName: "Christian M. Haas",
    profileDescription: "Dating-Experte",
    breadcrumbRootName: "50plus Magazin",
    breadcrumbRootUrl: "https://ab50.de/magazin",
  };

  assert.equal(buildChristianBookProfileGraph({ ...base, slug: "ordinary-post", content: markerContent }), null);
  assert.equal(buildChristianBookProfileGraph({ ...base, slug: "christian-m-haas", content: "<p>Kein Marker</p>" }), null);
  assert.equal(buildChristianBookProfileGraph({
    ...base,
    slug: "christian-m-haas",
    content: `${markerContent}${markerContent}`,
  }), null);
  assert.equal(buildChristianBookProfileGraph({
    ...base,
    slug: "christian-m-haas",
    content: `${BOOK_MARKER_START}<img src="javascript:alert(1)">${BOOK_MARKER_END}`,
  }), null);
});

const BOOK_MARKER_START = "<!-- dating-ohne-bullshit-book:start -->";
const BOOK_MARKER_END = "<!-- dating-ohne-bullshit-book:end -->";

test("escapes JSON-LD HTML breakers with the repository serializer", async () => {
  const { readFile } = await import("node:fs/promises");
  const serializer = await readFile(new URL("../lib/seo.ts", import.meta.url), "utf8");
  assert.match(serializer, /replace\(\/>\/g, "\\\\u003e"\)/);
  assert.match(serializer, /replace\(\/&\/g, "\\\\u0026"\)/);
  assert.match(serializer, /replace\(\/\\u2028\/g, "\\\\u2028"\)/);
  assert.match(serializer, /replace\(\/\\u2029\/g, "\\\\u2029"\)/);
});

test("the magazine page wires the graph through the repository safe serializer", async () => {
  const { readFile } = await import("node:fs/promises");
  const page = await readFile(new URL("../app/magazin/[slug]/page.tsx", import.meta.url), "utf8");

  assert.match(page, /buildChristianBookProfileGraph\(\{/);
  assert.match(page, /slug,\s*christianSlug: "christian-m-haas",\s*content: page\.content/);
  assert.match(page, /jsonLd\(profileGraph\)/);
});
