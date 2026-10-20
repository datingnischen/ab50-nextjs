import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

/**
 * Regel (Christian, 2026-10-20): Bilder gehören ins Repo, nicht ins ICONY-CMS. Kein Bild darf zur Laufzeit von
 * einem ICONY-Host kommen – weder als <img src>, next/image-remotePattern, CSS-Hintergrund, og:image/JSON-LD noch
 * über einen Proxy. Reine Herkunftsfelder in den Daten (sourceImageUrl, originalImageUrl …) bleiben erlaubt.
 */

const root = join(import.meta.dirname, "..");
const ICONY_HOST = /[a-z0-9.-]*icony-hosting\.de/i;
const PROVENANCE_KEYS = new Set(["sourceImageUrl", "originalImageUrl", "sourceUrl", "sourcePageUrl"]);
const SOURCE_DIRS = ["app", "components", "lib", "data"];
const SOURCE_FILES = ["next.config.mjs", "proxy.ts"];
const TEXT_EXT = new Set([".ts", ".tsx", ".mjs", ".js", ".css", ".md", ".html", ".xml", ".txt"]);

function walk(dir: string, out: string[] = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function jsonHits(value: unknown, path: string, hits: string[]) {
  if (typeof value === "string") {
    if (ICONY_HOST.test(value)) hits.push(path);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => jsonHits(item, `${path}[${index}]`, hits));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (PROVENANCE_KEYS.has(key)) continue;
      jsonHits(item, `${path}.${key}`, hits);
    }
  }
}

test("Quelltext und next.config verweisen auf keinen ICONY-Bildhost", () => {
  const files = [
    ...SOURCE_DIRS.flatMap((dir) => walk(join(root, dir))),
    ...SOURCE_FILES.map((file) => join(root, file)).filter((file) => existsSync(file)),
  ].filter((file) => TEXT_EXT.has(extname(file)));
  const offenders = files.filter((file) => ICONY_HOST.test(readFileSync(file, "utf8"))).map((file) => relative(root, file));
  assert.deepEqual(offenders, []);
});

test("Daten-JSON enthält ICONY-Bildhosts höchstens in Herkunftsfeldern", () => {
  const offenders: string[] = [];
  for (const file of walk(join(root, "data")).filter((name) => extname(name) === ".json")) {
    jsonHits(JSON.parse(readFileSync(file, "utf8")), relative(root, file), offenders);
  }
  assert.deepEqual(offenders, []);
});

test("CH-Stadtbilder liegen im Repo und haben Alt-Texte", async () => {
  const inventory = JSON.parse(readFileSync(join(root, "data/ch-partnersuche.json"), "utf8"));
  const pages = [inventory.overview, ...inventory.cities];
  for (const page of pages) {
    assert.match(page.heroImage.url, /^\/city-images\/ch\/[a-z0-9-]+\.jpg$/);
    assert.ok(existsSync(join(root, "public", page.heroImage.url)), page.heroImage.url);
    assert.ok(page.heroImage.alt?.trim(), `Alt-Text fehlt: ${page.heroImage.url}`);
    for (const match of page.contentHtml.matchAll(/<img\b[^>]*>/gi)) {
      const tag = match[0];
      const src = /\ssrc="([^"]+)"/.exec(tag)?.[1] ?? "";
      assert.match(src, /^\/city-images\/ch\//, tag);
      assert.ok(existsSync(join(root, "public", src)), src);
      assert.match(tag, /\salt="[^"\s][^"]*"/, `Alt-Text fehlt: ${tag}`);
    }
  }
});
