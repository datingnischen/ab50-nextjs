import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { handleWpRest } from "../lib/wp-rest-compat.ts";

// Zeitstempel erscheinen in JSON-LD, Sitemap und /magazin/wp-json. Sie dürfen nicht nach Automatik aussehen
// (Christian, 2026-11-13): keine runden Uhrzeiten, keine gemeinsamen Sekunden, keine Sammel-Aktualisierungen,
// höchstens zwei Beiträge je Erscheinungstag. Neue Beiträge: unregelmäßige Uhrzeit (7–22 Uhr, Sekunde ≠ 0),
// date_gmt/modified_gmt = Berliner Ortszeit minus 1 bzw. 2 Stunden, alle AIOSEO-Kopien gleich.
type Row = Record<string, any>;
const load = (file: string) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8")) as Row[];
const collections: Record<string, Row[]> = { "data/wp/posts.json": load("data/wp/posts.json"), "data/ch-magazin.json": load("data/ch-magazin.json") };
const pages = load("data/wp/pages.json");

// Datumsgebundene Ausnahmen von „höchstens zwei Beiträge je Tag“ (slug → Grund). Derzeit keine.
const SAME_DAY_EXCEPTIONS: Record<string, string> = {};

const berlinOffsetHours = (local: string) => {
  const year = Number(local.slice(0, 4));
  const lastSunday = (month: number) => {
    const day = new Date(Date.UTC(year, month + 1, 0));
    day.setUTCDate(day.getUTCDate() - day.getUTCDay());
    return day.toISOString().slice(0, 10);
  };
  return local >= `${lastSunday(2)}T02:00:00` && local < `${lastSunday(9)}T03:00:00` ? 2 : 1;
};
const toGmt = (local: string) => new Date(Date.parse(`${local}Z`) - berlinOffsetHours(local) * 3_600_000).toISOString().slice(0, 19);
const withOffset = (local: string) => `${local}+0${berlinOffsetHours(local)}:00`;
const isRound = (stamp: string) => /T\d\d:(00|30):00/.test(stamp) || /T00:00:\d\d/.test(stamp);
const nowBerlin = () => new Date(Date.now() + berlinOffsetHours(new Date().toISOString().slice(0, 19)) * 3_600_000).toISOString().slice(0, 19);

test("GMT-Felder passen zur Berliner Ortszeit, modified nie vor date, nichts in der Zukunft", () => {
  const now = nowBerlin();
  for (const [file, rows] of Object.entries({ ...collections, "data/wp/pages.json": pages })) {
    for (const row of rows) {
      const id = `${file} ${row.slug}`;
      assert.equal(row.date_gmt, toGmt(row.date), `${id} date_gmt`);
      assert.equal(row.modified_gmt, toGmt(row.modified), `${id} modified_gmt`);
      assert.ok(row.modified >= row.date, `${id}: modified vor date`);
      assert.ok(row.modified <= now, `${id}: modified in der Zukunft`);
    }
  }
});

test("AIOSEO-Kopien (Schema, article:*-Zeiten) tragen dieselben Zeiten wie date/modified", () => {
  for (const row of collections["data/wp/posts.json"]) {
    const head = row.aioseo_head_json;
    if (!head) continue;
    for (const node of head.schema?.["@graph"] ?? []) {
      if (node.datePublished) assert.equal(node.datePublished, withOffset(row.date), `${row.slug} datePublished`);
      if (node.dateModified) assert.equal(node.dateModified, withOffset(row.modified), `${row.slug} dateModified`);
    }
    if (head["article:published_time"]) assert.equal(head["article:published_time"], `${row.date_gmt}+00:00`, `${row.slug} published_time`);
    if (head["article:modified_time"]) assert.equal(head["article:modified_time"], `${row.modified_gmt}+00:00`, `${row.slug} modified_time`);
    if (typeof row.aioseo_head === "string") {
      assert.ok(row.aioseo_head.includes(withOffset(row.date)), `${row.slug}: aioseo_head ohne datePublished`);
    }
  }
});

test("Zeitstempel ab 2026 sind nicht rund und nicht doppelt", () => {
  const seen = new Map<string, string>();
  for (const rows of Object.values(collections)) {
    for (const row of rows) {
      for (const field of ["date", "modified"]) {
        const stamp: string = row[field];
        if (stamp < "2026") continue;
        assert.ok(!isRound(stamp), `${row.slug} ${field}: runde Uhrzeit ${stamp}`);
        if (field === "modified" && stamp === row.date) continue;
        assert.ok(!seen.has(stamp), `${row.slug} ${field}: gleiche Sekunde wie ${seen.get(stamp)}`);
        seen.set(stamp, row.slug);
      }
    }
  }
});

test("keine Sammel-Aktualisierung vieler Beiträge am selben Tag", () => {
  for (const [file, rows] of Object.entries(collections)) {
    const limit = rows.length < 30 ? 4 : 8;
    const perDay = new Map<string, number>();
    for (const row of rows) {
      const day = row.modified.slice(0, 10);
      if (day > row.date.slice(0, 10) && day >= "2026") perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }
    for (const [day, count] of perDay) assert.ok(count <= limit, `${file}: ${count} Beiträge mit modified am ${day}`);
  }
});

test("höchstens zwei Beiträge je Erscheinungstag (auch WP-REST-Teaser der Landesdomains)", () => {
  const ch = handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=100"), "ch").body as Row[];
  for (const [name, rows] of Object.entries({ ...collections, "wp-json ch": ch })) {
    const perDay = new Map<string, string[]>();
    for (const row of rows) {
      if (SAME_DAY_EXCEPTIONS[row.slug]) continue;
      const day = row.date.slice(0, 10);
      perDay.set(day, [...(perDay.get(day) ?? []), row.slug]);
    }
    for (const [day, slugs] of perDay) assert.ok(slugs.length <= 2, `${name}: ${slugs.length} Beiträge am ${day}: ${slugs.join(", ")}`);
  }
});
