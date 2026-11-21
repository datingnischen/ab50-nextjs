import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const widget = readFileSync(new URL("../components/icony-iframe-singles-widget.tsx", import.meta.url), "utf8");

test("Profilvorschau gibt Mindest- und Hoechstalter an die ICONY-API", () => {
  // Ohne age_max setzt ICONY den Standardwert 55; auf einer 50plus-Seite fehlen dann alle ab 56.
  assert.match(widget, /ageMin:\s*48,/);
  assert.match(widget, /ageMax:\s*99,/);
  assert.match(widget, /age_min:\s*options\.ageMin,/);
  assert.match(widget, /age_max:\s*options\.ageMax,/);
});

test("Profilvorschau gibt Land und PLZ des Ortes mit", () => {
  assert.match(widget, /country:\s*location\.country,/);
  assert.match(widget, /zip:\s*location\.zip/);
  assert.match(widget, /country:\s*options\.country,/);
  assert.match(widget, /zip:\s*options\.zip,/);
});
