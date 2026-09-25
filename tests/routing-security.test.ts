import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  resolveHostRequest,
  resolveMarketResourceRequest,
  resolvePartnersucheRequest,
  resolveTrailingSlashRedirect,
} from "../lib/market-router.ts";

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
    destination: "https://ab50.de/partnersuche/singles-berlin/",
  });
  assert.deepEqual(resolvePartnersucheRequest("www.ab50.ch", "/ch/partnersuche/zuerich"), {
    action: "redirect",
    destination: "https://ab50.ch/partnersuche/zuerich/",
  });
});

test("unknown hosts fail closed for partnersuche routes", () => {
  assert.deepEqual(resolvePartnersucheRequest("evil.example", "/partnersuche"), { action: "not-found" });
  assert.deepEqual(resolvePartnersucheRequest("evil.example", "/ch/partnersuche/zuerich"), { action: "not-found" });
});

test("the CH production host cannot expose the DE application tree", () => {
  assert.deepEqual(resolveHostRequest("ab50.ch", "/"), { action: "not-found" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/magazin"), { action: "not-found" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/ueber-uns/geschichte"), { action: "not-found" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/partnersuche/zuerich"), { action: "pass", market: "ch" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/ab50-ch-logo.svg"), { action: "pass", market: "ch" });
});

test("the CH host serves prerendered city art but nothing else under that path", () => {
  assert.deepEqual(resolveHostRequest("ab50.ch", "/stadtbild/zuerich-card.svg"), { action: "pass", market: "ch" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/stadtbild/la-chaux-de-fonds-thumb.svg"), { action: "pass", market: "ch" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/stadtbild/zuerich-hero.svg"), { action: "not-found" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/stadtbild/"), { action: "not-found" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/stadtbild/../magazin"), { action: "not-found" });
  assert.deepEqual(resolveHostRequest("ab50.ch", "/stadtbild/x-card.svg/../../magazin"), { action: "not-found" });
});

test("DE, preview, and unknown hosts follow an explicit application-host policy", () => {
  assert.deepEqual(resolveHostRequest("ab50.de", "/magazin"), { action: "pass", market: "de" });
  assert.deepEqual(resolveHostRequest("ab50-nextjs.vercel.app", "/ch/partnersuche"), { action: "pass" });
  assert.deepEqual(resolveHostRequest("localhost:3100", "/de/partnersuche"), { action: "pass" });
  assert.deepEqual(resolveHostRequest("evil.example", "/"), { action: "not-found" });
  assert.deepEqual(resolveHostRequest("evil.example", "/magazin"), { action: "not-found" });
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

test("page paths without trailing slash redirect relatively on the same host", () => {
  assert.deepEqual(resolveTrailingSlashRedirect("ab50-nextjs.vercel.app", "/magazin"), { destination: "/magazin/", absolute: false });
  assert.deepEqual(resolveTrailingSlashRedirect("ab50.de", "/magazin/kategorie/leben"), { destination: "/magazin/kategorie/leben/", absolute: false });
  assert.deepEqual(resolveTrailingSlashRedirect("ab50.ch", "/partnersuche/zuerich"), { destination: "/partnersuche/zuerich/", absolute: false });
});

test("internal market prefixes redirect absolutely to the public country domain", () => {
  assert.deepEqual(resolveTrailingSlashRedirect("ab50-nextjs.vercel.app", "/ch/partnersuche/zuerich"), {
    destination: "https://ab50.ch/partnersuche/zuerich/", absolute: true,
  });
  assert.deepEqual(resolveTrailingSlashRedirect("ab50-nextjs.vercel.app", "/de/partnersuche"), {
    destination: "https://ab50.de/partnersuche/", absolute: true,
  });
  assert.deepEqual(resolveTrailingSlashRedirect("ab50.ch", "/ch/partnersuche/basel"), {
    destination: "https://ab50.ch/partnersuche/basel/", absolute: true,
  });
  // Fremdes Präfix auf einer Landesdomain bleibt beim 404 des Routers.
  assert.equal(resolveTrailingSlashRedirect("ab50.de", "/ch/partnersuche/zuerich"), null);
});

test("paths with slash, root, files and asset paths never get a slash redirect", () => {
  for (const pathname of [
    "/",
    "/magazin/",
    "/ch/partnersuche/zuerich/",
    "/sitemap.xml",
    "/robots.txt",
    "/ch/sitemap.xml",
    "/stadtbild/zuerich-card.svg",
    "/ab50-ch-logo.svg",
    "/app-assets/ab50-logo",
    "/_next/static/chunks/main",
    "/api/health",
    "/.well-known/security",
  ]) {
    assert.equal(resolveTrailingSlashRedirect("ab50-nextjs.vercel.app", pathname), null, pathname);
  }
});
