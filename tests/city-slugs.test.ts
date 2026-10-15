import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { publicCitySlug } from "../lib/city-slugs.ts";

test("München und Düsseldorf haben eine einzige öffentliche Adresse mit Umlaut", () => {
  assert.equal(publicCitySlug("singles-muenchen"), "singles-münchen");
  assert.equal(publicCitySlug("singles-duesseldorf"), "singles-düsseldorf");
  assert.equal(publicCitySlug("singles-münchen"), "singles-münchen");
  assert.equal(publicCitySlug("singles-berlin"), "singles-berlin");
});

test("die ASCII-Schreibweise leitet dauerhaft auf die Umlaut-Adresse um", () => {
  const config = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8");
  assert.match(config, /\["singles-muenchen", "singles-m%C3%BCnchen"\]/);
  assert.match(config, /\["singles-duesseldorf", "singles-d%C3%BCsseldorf"\]/);
  assert.match(config, /cityPath|partnersuche\/\$\{to\}/);
});

test("cityPath liefert die öffentliche Adresse (Canonical und interne Links)", () => {
  const source = readFileSync(new URL("../lib/wordpress.ts", import.meta.url), "utf8");
  assert.match(source, /return `\/partnersuche\/\$\{publicCitySlug\(slug\)\}\/`;/);
});
