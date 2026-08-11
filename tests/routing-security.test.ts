import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveMarketResourceRequest, resolvePartnersucheRequest } from "../lib/market-router.ts";

test("ICONY srcDoc iframe never combines scripts with same-origin access", () => {
  const source = readFileSync(new URL("../components/icony-iframe-singles-widget.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /sandbox="[^"]*allow-scripts[^"]*allow-same-origin/);
  assert.doesNotMatch(source, /sandbox="[^"]*allow-same-origin[^"]*allow-scripts/);
});

test("preview hosts expose only explicit DE and CH market namespaces", () => {
  assert.deepEqual(resolvePartnersucheRequest("ab50-nextjs.vercel.app", "/de/partnersuche"), { action: "pass", market: "de" });
  assert.deepEqual(resolvePartnersucheRequest("localhost", "/ch/partnersuche/zuerich"), { action: "pass", market: "ch" });
  assert.deepEqual(resolvePartnersucheRequest("ab50-nextjs.vercel.app", "/at/partnersuche"), { action: "not-found" });
});

test("country hosts own prefix-free partnersuche and reject cross-market prefixes", () => {
  assert.deepEqual(resolvePartnersucheRequest("ab50.de", "/partnersuche/singles-berlin"), {
    action: "rewrite",
    destination: "/de/partnersuche/singles-berlin",
    market: "de",
  });
  assert.deepEqual(resolvePartnersucheRequest("ab50.ch", "/partnersuche/zuerich"), {
    action: "rewrite",
    destination: "/ch/partnersuche/zuerich",
    market: "ch",
  });
  assert.deepEqual(resolvePartnersucheRequest("ab50.de", "/ch/partnersuche/zuerich"), { action: "not-found" });
  assert.deepEqual(resolvePartnersucheRequest("ab50.ch", "/de/partnersuche/singles-berlin"), { action: "not-found" });
});

test("country hosts redirect their own implementation prefix to a public URL", () => {
  assert.deepEqual(resolvePartnersucheRequest("www.ab50.de", "/de/partnersuche/singles-berlin"), {
    action: "redirect",
    destination: "https://ab50.de/partnersuche/singles-berlin",
  });
  assert.deepEqual(resolvePartnersucheRequest("www.ab50.ch", "/ch/partnersuche/zuerich"), {
    action: "redirect",
    destination: "https://ab50.ch/partnersuche/zuerich",
  });
});

test("unknown hosts fail closed for partnersuche routes", () => {
  assert.deepEqual(resolvePartnersucheRequest("evil.example", "/partnersuche"), { action: "not-found" });
  assert.deepEqual(resolvePartnersucheRequest("evil.example", "/ch/partnersuche/zuerich"), { action: "not-found" });
});

test("country hosts receive market-specific sitemap and robots resources", () => {
  assert.deepEqual(resolveMarketResourceRequest("ab50.de", "/sitemap.xml"), { action: "pass", market: "de" });
  assert.deepEqual(resolveMarketResourceRequest("ab50.de", "/robots.txt"), { action: "pass", market: "de" });
  assert.deepEqual(resolveMarketResourceRequest("ab50.ch", "/sitemap.xml"), {
    action: "rewrite", destination: "/ch/sitemap.xml", market: "ch",
  });
  assert.deepEqual(resolveMarketResourceRequest("ab50.ch", "/robots.txt"), {
    action: "rewrite", destination: "/ch/robots.txt", market: "ch",
  });
  assert.deepEqual(resolveMarketResourceRequest("ab50.de", "/ch/sitemap.xml"), { action: "not-found" });
  assert.deepEqual(resolveMarketResourceRequest("ab50.ch", "/de/sitemap.xml"), { action: "not-found" });
  assert.deepEqual(resolveMarketResourceRequest("evil.example", "/sitemap.xml"), { action: "not-found" });
});
