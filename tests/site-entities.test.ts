import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildMagazineArticleGraph, buildSiteGraph, withBerlinOffset } from "../lib/site-entities.ts";

const siteRoot = "https://ab50.de/";
const readRepoFile = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
type Node = Record<string, any>;

test("the site graph links operator, brand profiles and website", () => {
  const sameAs = ["https://www.facebook.com/ab50de/", "https://www.youtube.com/@ab50de"];
  const graph = buildSiteGraph({
    siteRoot,
    sameAs,
    page: { type: "AboutPage", url: "https://ab50.de/ueber-uns/", name: "Über ab50.de", description: "Beschreibung" },
  });
  const nodes = graph["@graph"] as Node[];

  assert.deepEqual(nodes.map((node) => node["@type"]), ["Organization", "Brand", "WebSite", "AboutPage"]);
  const [operator, brand, website, page] = nodes;
  assert.equal(operator.name, "ICONY GmbH");
  assert.equal(brand["@id"], "https://ab50.de/#brand");
  assert.deepEqual(brand.sameAs, sameAs);
  assert.equal(website.publisher["@id"], operator["@id"]);
  assert.equal(website.about["@id"], brand["@id"]);
  assert.equal(page.isPartOf["@id"], website["@id"]);
});

test("brand sameAs holds only the brand's own profiles, not the group or Trustpilot", () => {
  const pages = readRepoFile("data/standard-pages.ts");
  const brandProfiles = [...pages.matchAll(/href: "([^"]+)",[\s\S]*?(?=\n {6}\})/g)]
    .filter((match) => match[0].includes("brandProfile: true"))
    .map((match) => match[1]);
  assert.deepEqual(brandProfiles, ["https://www.facebook.com/ab50de/", "https://www.youtube.com/@ab50de"]);
  assert.doesNotMatch(readRepoFile("app/ueber-uns/page.tsx"), /trustpilot\.com/);
  assert.match(readRepoFile("components/site-json-ld.tsx"), /sameAs: brandSameAs\(\)/);
});

test("magazine posts get a BlogPosting with linked author, operator and category breadcrumb", () => {
  const url = "https://ab50.de/magazin/wieder-daten-ab-50/";
  const graph = buildMagazineArticleGraph({
    siteRoot,
    magazineName: "50plus Magazin",
    magazineUrl: "https://ab50.de/magazin/",
    url,
    headline: "Wieder daten ab 50",
    description: "Beschreibung",
    image: "https://ab50.de/magazin/wp-content/uploads/bild.jpg",
    datePublished: "2026-10-14T14:30:26",
    dateModified: "2026-12-01T09:00:00",
    author: { name: "Christian M. Haas", profileUrl: "https://ab50.de/magazin/christian-m-haas/" },
    category: { name: "Neustart", url: "https://ab50.de/magazin/kategorie/neustart/" },
  });
  const byType = Object.fromEntries((graph["@graph"] as Node[]).map((node) => [node["@type"], node]));

  assert.deepEqual(Object.keys(byType), ["WebPage", "BreadcrumbList", "BlogPosting", "WebSite", "Organization"]);
  const article = byType.BlogPosting;
  assert.equal(article["@id"], `${url}#article`);
  assert.equal(article.mainEntityOfPage["@id"], `${url}#webpage`);
  assert.equal(article.author["@id"], "https://ab50.de/magazin/christian-m-haas/#person");
  assert.equal(article.publisher["@id"], "https://ab50.de/#operator");
  assert.equal(article.isPartOf["@id"], "https://ab50.de/#website");
  assert.equal(article.datePublished, "2026-10-14T14:30:26+02:00");
  assert.equal(article.dateModified, "2026-12-01T09:00:00+01:00");
  assert.deepEqual(
    byType.BreadcrumbList.itemListElement.map((item: Node) => item.name),
    ["Startseite", "50plus Magazin", "Neustart", "Wieder daten ab 50"],
  );
});

test("authors without a profile page stay the editorial organization", () => {
  const graph = buildMagazineArticleGraph({
    siteRoot,
    magazineName: "50plus Magazin",
    magazineUrl: "https://ab50.de/magazin/",
    url: "https://ab50.de/magazin/beitrag/",
    headline: "Beitrag",
    description: "Beschreibung",
    author: { name: "ab50.de Redaktion" },
  });
  const article = (graph["@graph"] as Node[]).find((node) => node["@type"] === "BlogPosting")!;
  assert.equal(article.author["@type"], "Organization");
  assert.equal(article.author["@id"], undefined);
});

test("CMS pages get page and breadcrumb but no BlogPosting", () => {
  const graph = buildMagazineArticleGraph({
    kind: "page",
    siteRoot,
    magazineName: "50plus Magazin",
    magazineUrl: "https://ab50.de/magazin/",
    url: "https://ab50.de/magazin/inhaltsverzeichnis/",
    headline: "Inhaltsverzeichnis",
    description: "Beschreibung",
  });
  const types = (graph["@graph"] as Node[]).map((node) => node["@type"]);
  assert.deepEqual(types, ["WebPage", "BreadcrumbList", "WebSite", "Organization"]);
});

test("WordPress dates get the real Berlin offset", () => {
  assert.equal(withBerlinOffset("2026-01-10T07:05:37"), "2026-01-10T07:05:37+01:00");
  assert.equal(withBerlinOffset("2026-07-10T07:05:37"), "2026-07-10T07:05:37+02:00");
  assert.equal(withBerlinOffset(null), undefined);
});

test("magazine start, about pages and articles render the shared graphs", () => {
  for (const path of ["app/magazin/page.tsx", "app/ueber-uns/page.tsx", "components/standard-content-page.tsx", "components/about-history-page.tsx"]) {
    assert.match(readRepoFile(path), /<SiteJsonLd/, path);
  }
  assert.match(readRepoFile("app/magazin/[slug]/page.tsx"), /buildMagazineArticleGraph\(/);
});
