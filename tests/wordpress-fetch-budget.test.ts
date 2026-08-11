import test from "node:test";
import assert from "node:assert/strict";
import { postCardQuery } from "../lib/wordpress-query.ts";

test("magazine overview requests a bounded WordPress post-card payload", () => {
  const query = postCardQuery(36);
  const fields = String(query._fields || "").split(",");

  assert.equal(query._embed, "wp:featuredmedia");
  assert.equal(query.per_page, 36);
  assert.ok(fields.includes("_links"), "WordPress requires _links to materialize _embedded data");
  assert.ok(fields.includes("_embedded"));
  assert.ok(fields.includes("excerpt"));
  assert.ok(!fields.includes("content"), "overview cards must not fetch full article bodies");
  assert.ok(!fields.includes("acf"), "overview cards must not fetch ACF payloads");
});
