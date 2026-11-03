import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../components/de-partnersuche-city.tsx", import.meta.url), "utf8");

test("Quiz-Hinweis auf kasseler-singles.de nur für Kassel, vor dem Quellenblock", () => {
  const map = source.slice(source.indexOf("const cityNicheHints"), source.indexOf("const cityAuthor"));
  assert.deepEqual([...map.matchAll(/^\s+"([a-z-]+)": \{/gm)].map((match) => match[1]), ["singles-kassel"]);
  assert.match(map, /anchor: "Single-Check für Kassel"/);
  assert.match(map, /href: "https:\/\/kasseler-singles\.de\/#quiz"/);
  const hint = source.indexOf("{nicheHint ? (");
  assert.ok(hint > 0, "Hinweis fehlt");
  assert.ok(hint < source.lastIndexOf("<SourceBox"), "Hinweis steht vor dem Quellenblock");
  assert.doesNotMatch(source.slice(hint, source.indexOf("</p>", hint)), /sponsored|nofollow/);
});
