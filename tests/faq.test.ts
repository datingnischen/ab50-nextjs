import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const faq = JSON.parse(readFileSync(new URL("../data/faq.json", import.meta.url), "utf8"));

test("FAQ-Daten: Themen mit Fragen und Antworten, übernommen von der ICONY-Seite", () => {
  assert.equal(faq.source, "https://ab50.de/faq/");
  assert.ok(faq.sections.length >= 8);
  for (const section of faq.sections) {
    assert.ok(section.title && section.items.length > 0, section.title);
    for (const item of section.items) {
      assert.ok(item.question.trim() && item.answerHtml.trim(), item.question);
      assert.ok(!/\ufffd/.test(item.question + item.answerHtml), "Kodierungsfehler");
    }
  }
});

test("FAQ-Daten: ICONY-Seiten absolut auf die Live-Domain, keine Vercel-Links", () => {
  const html = JSON.stringify(faq);
  assert.ok(!/vercel\.app/.test(html));
  assert.ok(!/href=\\"\/(?:hilfe|kontakt|login|suche)/.test(html), "ICONY-Seite relativ verlinkt");
});

test("FAQ-Seite liefert FAQPage-Schema und ist in Sitemap und Über-uns-Navigation verlinkt", () => {
  const page = readFileSync(new URL("../app/faq/page.tsx", import.meta.url), "utf8");
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /canonical: FAQ_PATH/);
  assert.match(readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8"), /\/faq\//);
  assert.match(readFileSync(new URL("../components/ab-info/info-parts.tsx", import.meta.url), "utf8"), /href: "\/faq\/"/);
  assert.match(readFileSync(new URL("../components/site-shell.tsx", import.meta.url), "utf8"), /href: "\/faq\/"/);
});
