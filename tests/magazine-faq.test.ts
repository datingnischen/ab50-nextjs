import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildMagazineFaqGraph, extractMagazineFaq } from "../lib/magazine-faq.ts";

test("FAQ-Bausteine werden zu FAQPage-Fragen", () => {
  const html = '<section class="mag-faq"><details class="mag-faq-item"><summary>Frage?</summary><div class="mag-faq-answer"><p>Antwort &amp; mehr</p></div></details></section>';
  assert.deepEqual(extractMagazineFaq(html), [{ question: "Frage?", answer: "Antwort & mehr" }]);
  const graph = buildMagazineFaqGraph("https://ab50.de/magazin/x/", html);
  assert.equal(graph?.["@type"], "FAQPage");
  assert.equal(buildMagazineFaqGraph("https://ab50.de/magazin/x/", "<p>ohne FAQ</p>"), null);
});

test("LAT-Artikel nutzt Bausteine statt reinem Fließtext", () => {
  const posts = JSON.parse(readFileSync(new URL("../data/wp/posts.json", import.meta.url), "utf8")) as Array<{ slug: string; content: { rendered: string } }>;
  const html = posts.find((post) => post.slug === "living-apart-together-ab-50")?.content.rendered || "";
  for (const block of ["mag-stats", "mag-chart", "mag-compare", "mag-steps", "mag-verdict", "mag-faq"]) {
    assert.match(html, new RegExp(`class="${block}"`), block);
  }
  assert.ok(extractMagazineFaq(html).length >= 4);
  const css = readFileSync(new URL("../app/magazine-blocks.css", import.meta.url), "utf8");
  assert.match(readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8"), /magazine-blocks\.css/);
  for (const selector of [".ab-rich .mag-stat", ".ab-rich .mag-faq-item", ".ab-rich .mag-split-bar"]) assert.ok(css.includes(selector), selector);
});
