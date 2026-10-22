import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { limitStrong, withoutHeadingSkips } from "../lib/html-cleanup.ts";

test("heading levels never skip and siblings stay siblings", () => {
  assert.equal(
    withoutHeadingSkips("<h2>A</h2><h4>B</h4><h4>C</h4><h3>D</h3><h2>E</h2><h5>F</h5>"),
    "<h2>A</h2><h3>B</h3><h3>C</h3><h3>D</h3><h2>E</h2><h3>F</h3>",
  );
});

test("strong tags are capped, deduplicated and empty ones keep the word gap", () => {
  const html = "<strong>a</strong><strong>b</strong><strong>a</strong><strong>c</strong><strong>d</strong><strong>e</strong>";
  assert.equal(limitStrong(html), '<strong>a</strong><strong>b</strong><span class="em-strong">a</span><strong>c</strong><strong>d</strong><span class="em-strong">e</span>');
  assert.equal(limitStrong("Nachhaltige<strong> </strong>französische"), "Nachhaltige französische");
});

test("doppelt verschachtelte Hervorhebungen ergeben gültiges HTML", () => {
  assert.equal(limitStrong("<strong>a</strong><strong>a</strong><strong><strong>T</strong></strong>"), "<strong>a</strong><span class=\"em-strong\">a</span><strong>T</strong>");
});

test("templates and FAQ add no strong tags beyond the article budget (Seobility strong/bold)", () => {
  // Vorlagen-Hervorhebungen als .sx-strong, sonst kommen zu den vier Artikel-Strongs weitere (Autorenprofil 8, Artikel 5).
  const page = readFileSync("app/magazin/[slug]/page.tsx", "utf8");
  assert.doesNotMatch(page, /<li><strong>/);
  assert.doesNotMatch(page, /<strong>\{authorName\}<\/strong>/);
  const faq = readFileSync("data/faq.json", "utf8");
  const strongs = [...faq.matchAll(/<strong>([^<]*)<\/strong>/g)].map((match) => match[1].toLowerCase());
  assert.ok(strongs.length <= 4);
  assert.equal(new Set(strongs).size, strongs.length);
});
