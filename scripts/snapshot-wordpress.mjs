// Einmalwerkzeug: zieht die öffentlichen WordPress-Inhalte von ab50.de als JSON nach data/wp/.
// Danach liest die App nur noch diese Dateien (lib/wordpress.ts); WordPress wird nicht mehr abgefragt.
// Nach redaktionellen Änderungen im Repo NICHT erneut laufen lassen.
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.WP_SNAPSHOT_BASE || "https://ab50.de/magazin/wp-json/wp/v2";
const OUT = path.join(import.meta.dirname, "..", "data", "wp");
fs.mkdirSync(OUT, { recursive: true });

async function all(endpoint, params = {}) {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const query = new URLSearchParams({ ...params, per_page: "100", page: String(page) });
    const res = await fetch(`${BASE}/${endpoint}?${query}`, { headers: { "User-Agent": "ab50 snapshot" } });
    if (!res.ok) throw new Error(`${endpoint} ${res.status}`);
    rows.push(...(await res.json()));
    if (page >= Number(res.headers.get("x-wp-totalpages") || 1)) return rows;
  }
}

const jobs = {
  posts: ["posts", { _embed: "1" }],
  pages: ["pages", {}],
  categories: ["categories", { hide_empty: "true" }],
  stadt: ["stadt", { _embed: "1", status: "publish" }],
};
for (const [file, [endpoint, params]] of Object.entries(jobs)) {
  const rows = await all(endpoint, params);
  fs.writeFileSync(path.join(OUT, `${file}.json`), JSON.stringify(rows, null, 1) + "\n");
  console.log(file, rows.length);
}
