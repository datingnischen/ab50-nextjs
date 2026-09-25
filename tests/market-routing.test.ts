import test from "node:test";
import assert from "node:assert/strict";
import {
  marketFromLocation,
  marketFromPathname,
  marketPreviewPath,
  withSlashedPageLinks,
  withTrailingSlash,
  publicMarketUrl,
  registrationUrl,
} from "../lib/markets.ts";

test("marketFromPathname resolves explicit preview markets and defaults to DE", () => {
  assert.equal(marketFromPathname("/de/partnersuche"), "de");
  assert.equal(marketFromPathname("/ch/partnersuche/zuerich"), "ch");
  assert.equal(marketFromPathname("/partnersuche"), "de");
});

test("production host identity overrides a prefix-free visible pathname", () => {
  assert.equal(marketFromLocation("/partnersuche", "ab50.ch"), "ch");
  assert.equal(marketFromLocation("/partnersuche/zuerich", "www.ab50.ch"), "ch");
  assert.equal(marketFromLocation("/partnersuche", "ab50.de"), "de");
  assert.equal(marketFromLocation("/ch/partnersuche", "ab50-nextjs.vercel.app"), "ch");
});

test("marketPreviewPath adds exactly one market prefix and preserves query and hash", () => {
  assert.equal(marketPreviewPath("de", "/partnersuche?from=footer#cities"), "/de/partnersuche/?from=footer#cities");
  assert.equal(marketPreviewPath("ch", "/ch/partnersuche/zuerich"), "/ch/partnersuche/zuerich/");
  assert.equal(marketPreviewPath("ch", "/partnersuche/zuerich/"), "/ch/partnersuche/zuerich/");
});

test("publicMarketUrl emits prefix-free country URLs with trailing slash", () => {
  assert.equal(publicMarketUrl("de", "/partnersuche"), "https://ab50.de/partnersuche/");
  assert.equal(publicMarketUrl("de", "/"), "https://ab50.de/");
  assert.equal(publicMarketUrl("de", "/sitemap.xml"), "https://ab50.de/sitemap.xml");
  assert.equal(publicMarketUrl("ch", "/partnersuche/zuerich"), "https://ab50.ch/partnersuche/zuerich/");
});

test("location registration URLs are market-specific", () => {
  assert.equal(registrationUrl("de", "location"), "https://ab50.de/?AID=location");
  assert.equal(registrationUrl("ch", "location"), "https://ab50.ch/?AID=location");
});

test("withTrailingSlash appends the slash to page paths only", () => {
  assert.equal(withTrailingSlash("/magazin"), "/magazin/");
  assert.equal(withTrailingSlash("/magazin/"), "/magazin/");
  assert.equal(withTrailingSlash("/"), "/");
  assert.equal(withTrailingSlash("/partnersuche?x=1#top"), "/partnersuche/?x=1#top");
  assert.equal(withTrailingSlash("/sitemap.xml"), "/sitemap.xml");
  assert.equal(withTrailingSlash("/stadtbild/zuerich-card.svg"), "/stadtbild/zuerich-card.svg");
});

test("withSlashedPageLinks adds the slash to own page links in imported HTML only", () => {
  const html = [
    '<a href="/partnersuche/bern">Bern</a>',
    '<a href="https://ab50.de/partnersuche/singles-kassel">Kassel</a>',
    '<a href="/partnersuche?x=1#top">Hub</a>',
    '<a href="/partnersuche/">Hub</a>',
    '<a href="https://ab50.ch/impressum.html">Impressum</a>',
    '<a href="https://ab50.de/magazin/wp-content/uploads/a">Datei</a>',
    '<a href="https://example.com/seite">Fremd</a>',
    '<a href="#abschnitt">Anker</a>',
  ].join("");
  assert.equal(withSlashedPageLinks(html), [
    '<a href="/partnersuche/bern/">Bern</a>',
    '<a href="https://ab50.de/partnersuche/singles-kassel/">Kassel</a>',
    '<a href="/partnersuche/?x=1#top">Hub</a>',
    '<a href="/partnersuche/">Hub</a>',
    '<a href="https://ab50.ch/impressum.html">Impressum</a>',
    '<a href="https://ab50.de/magazin/wp-content/uploads/a">Datei</a>',
    '<a href="https://example.com/seite">Fremd</a>',
    '<a href="#abschnitt">Anker</a>',
  ].join(""));
});
