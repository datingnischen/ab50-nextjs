import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SEO_TITLES, TITLE_MAX_WIDTH, TITLE_SUFFIX, seoTitle, titleWidth } from "../lib/seo-title.ts";
import { clampMetaDescription, META_DESCRIPTION_MAX, PAGE_META_DESCRIPTIONS, POST_META_DESCRIPTIONS, pageMetaDescription } from "../lib/meta-description.ts";
import { resolveMarketResourceRequest } from "../lib/market-router.ts";

const decode = (value: string) => value
  .replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&#038;/g, "&").replace(/&amp;/g, "&")
  .replace(/&#8217;/g, "’").replace(/&#8222;/g, "„").replace(/&#8220;/g, "“").replace(/<[^>]+>/g, "");

function renderedWidth(title: ReturnType<typeof seoTitle>) {
  return typeof title === "string" ? titleWidth(`${title}${TITLE_SUFFIX}`) : titleWidth(String((title as { absolute: string }).absolute));
}

test("width table matches the canvas measurement used by Seobility", () => {
  // Canvas (20px Arial): 585,5 px; Seobility meldete 590 px.
  assert.ok(Math.abs(titleWidth("Kosten von Singlebörsen ab 50 – was lohnt sich wirklich | ab50.de") - 585.5) < 0.5);
});

test("every magazine post and page title fits into the search result width", () => {
  for (const file of ["posts", "pages"]) {
    const entries = JSON.parse(readFileSync(new URL(`../data/wp/${file}.json`, import.meta.url), "utf8")) as Array<{ slug: string; title: { rendered: string } }>;
    for (const entry of entries) {
      const width = renderedWidth(seoTitle(decode(entry.title.rendered), entry.slug));
      assert.ok(width <= TITLE_MAX_WIDTH, `${entry.slug}: ${Math.round(width)} px`);
    }
  }
});

test("short titles keep the brand suffix, titles with the domain never repeat it", () => {
  assert.equal(seoTitle("Witwer sucht Witwe"), "Witwer sucht Witwe");
  assert.deepEqual(seoTitle("Über ab50.de"), { absolute: "Über ab50.de" });
  assert.deepEqual(seoTitle("Häufige Fragen zu ab50.de (FAQ)"), { absolute: "Häufige Fragen zu ab50.de (FAQ)" });
});

test("override titles all fit including the suffix", () => {
  for (const [slug, title] of Object.entries(SEO_TITLES)) {
    assert.ok(titleWidth(`${title}${TITLE_SUFFIX}`) <= TITLE_MAX_WIDTH, slug);
  }
});

test("meta descriptions are clamped at a sentence or word boundary", () => {
  const long = "Die erfolgreiche Partnersuche für Singles ab 50 Die Partnersuche im reiferen Alter muss nicht unbedingt zur Hürde werden. Die sogenannten Best ager stehen mitten im Leben, wissen worauf es ankommt";
  const result = clampMetaDescription(long);
  assert.ok(result.length <= META_DESCRIPTION_MAX);
  assert.ok(result.endsWith("zur Hürde werden."));
  assert.equal(clampMetaDescription("Artikel kurz anhören Die wichtigsten Punkte kurz und verständlich zusammengefasst. Dein Browser unterstützt das Audio-Element nicht. Kurzer Text..."), "Kurzer Text");
});

test("magazine sitemap at the old WordPress address is served, not treated as a country prefix", () => {
  assert.deepEqual(resolveMarketResourceRequest("ab50.de", "/magazin/sitemap.xml"), { action: "pass", market: "de" });
  assert.deepEqual(resolveMarketResourceRequest("localhost:3002", "/magazin/sitemap.xml"), { action: "pass", market: "de" });
  assert.equal(resolveMarketResourceRequest("ab50.de", "/foo/sitemap.xml").action, "not-found");
});

test("fixed magazine pages get their own description, never the iframe fallback text", () => {
  const pages = JSON.parse(readFileSync("data/wp/pages.json", "utf8")) as Array<{ slug: string; content: { rendered: string } }>;
  const descriptions = pages.map((page) => pageMetaDescription(page.slug, decode(page.content.rendered).replace(/&[a-z]+;/g, " ")));
  for (const [index, description] of descriptions.entries()) {
    assert.doesNotMatch(description, /Ihr Browser kann leider/, pages[index].slug);
  }
  assert.equal(new Set(descriptions).size, descriptions.length);
  for (const [slug, description] of Object.entries({ ...PAGE_META_DESCRIPTIONS, ...POST_META_DESCRIPTIONS })) {
    assert.ok(description.length >= 110 && description.length <= META_DESCRIPTION_MAX, slug);
  }
});

test("own page titles carry the domain only as the template suffix", () => {
  for (const file of ["app/faq/page.tsx", "app/ueber-uns/page.tsx"]) {
    const metadata = readFileSync(file, "utf8").split("export const metadata")[1].split("};")[0];
    assert.doesNotMatch(metadata, /title: \{ absolute/, file);
    assert.doesNotMatch(readFileSync(file, "utf8").match(/const TITLE = "[^"]*"|  title: "[^"]*"/)?.[0] || "", /ab50\./, file);
  }
  assert.equal(SEO_TITLES["online-dating"], "Online-Dating ab 50: So gelingt der Einstieg");
});

test("FAQ and Über uns descriptions have search snippet length", () => {
  for (const file of ["app/faq/page.tsx", "app/ueber-uns/page.tsx"]) {
    const description = readFileSync(file, "utf8").match(/const DESCRIPTION = "([^"]*)"/)?.[1] || "";
    assert.ok(description.length >= 110 && description.length <= 155, file);
  }
});
