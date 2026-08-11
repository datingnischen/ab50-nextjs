import test from "node:test";
import assert from "node:assert/strict";
import {
  marketFromLocation,
  marketFromPathname,
  marketPreviewPath,
  publicMarketUrl,
  registrationUrl,
} from "../lib/markets.ts";

test("marketFromPathname resolves explicit preview markets and defaults to DE", () => {
  assert.equal(marketFromPathname("/de/partnersuche"), "de");
  assert.equal(marketFromPathname("/ch/partnersuche/zuerich"), "ch");
  assert.equal(marketFromPathname("/partnersuche"), "de");
});

test("production host identity overrides a prefix-free visible pathname", () => {
  assert.equal(marketFromLocation("/partnersuche", "ab50.ch"), "ch");
  assert.equal(marketFromLocation("/partnersuche/zuerich", "www.ab50.ch"), "ch");
  assert.equal(marketFromLocation("/partnersuche", "ab50.de"), "de");
  assert.equal(marketFromLocation("/ch/partnersuche", "ab50-nextjs.vercel.app"), "ch");
});

test("marketPreviewPath adds exactly one market prefix and preserves query and hash", () => {
  assert.equal(marketPreviewPath("de", "/partnersuche?from=footer#cities"), "/de/partnersuche?from=footer#cities");
  assert.equal(marketPreviewPath("ch", "/ch/partnersuche/zuerich"), "/ch/partnersuche/zuerich");
});

test("publicMarketUrl emits prefix-free country URLs", () => {
  assert.equal(publicMarketUrl("de", "/partnersuche"), "https://ab50.de/partnersuche");
  assert.equal(publicMarketUrl("ch", "/partnersuche/zuerich"), "https://ab50.ch/partnersuche/zuerich");
});

test("location registration URLs are market-specific", () => {
  assert.equal(registrationUrl("de", "location"), "https://ab50.de/?AID=location");
  assert.equal(registrationUrl("ch", "location"), "https://ab50.ch/?AID=location");
});
