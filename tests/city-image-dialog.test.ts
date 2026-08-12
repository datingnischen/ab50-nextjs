import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const componentUrl = new URL("../components/city-image-dialog.tsx", import.meta.url);
const cityPageSource = readFileSync(new URL("../app/ch/partnersuche/[slug]/page.tsx", import.meta.url), "utf8");
const overviewPageSource = readFileSync(new URL("../app/ch/partnersuche/page.tsx", import.meta.url), "utf8");
const globalCssSource = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

const publicSourcePattern = /city-source-box|\.sourceUrl|Öffentliche Originalseite auf ab50\.ch/;

test("Swiss city hero uses the large-image dialog component", () => {
  assert.match(cityPageSource, /<CityImageDialog[\s\S]*registrationUrl=\{registration\}/);
});

test("Swiss partnersuche pages keep migration provenance out of the public page", () => {
  assert.doesNotMatch(cityPageSource, publicSourcePattern);
  assert.doesNotMatch(overviewPageSource, publicSourcePattern);
});

test("Swiss city cards present their destination as a button-style call to action", () => {
  assert.match(overviewPageSource, /className="card-read-more city-card-button">Stadtseite ansehen/);
  assert.match(globalCssSource, /\.city-card-button\s*\{/);
});

test("Swiss overview reserves Kostenlos starten for the clickable hero action", () => {
  assert.match(overviewPageSource, /<span>Seriös kennenlernen<\/span>/);
  assert.doesNotMatch(overviewPageSource, /<span>Kostenlos starten<\/span>/);
});

test("city image dialog is accessible and keeps registration available", () => {
  const source = readFileSync(componentUrl, "utf8");

  assert.match(source, /<button[^>]*aria-label=/);
  assert.match(source, /<dialog/);
  assert.match(source, /showModal\(\)/);
  assert.match(source, /<button[^>]*className="city-image-dialog-close"/);
  assert.match(source, /href=\{registrationUrl\}/);
  assert.match(source, />Kostenlos registrieren</);
});

test("enlarged city image preserves its aspect ratio when viewport height constrains it", () => {
  const rule = globalCssSource.match(/\.city-image-dialog-image\s*\{([^}]*)\}/)?.[1] || "";

  assert.match(rule, /width:\s*auto/);
  assert.match(rule, /height:\s*auto/);
  assert.match(rule, /max-width:\s*100%/);
  assert.match(rule, /max-height:/);
});
