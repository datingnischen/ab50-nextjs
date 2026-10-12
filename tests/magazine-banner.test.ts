import test from "node:test";
import assert from "node:assert/strict";
import { bannerForArticle } from "../lib/magazine-banner.ts";

test("article topic takes priority over its broad category", () => {
  assert.equal(bannerForArticle("wieder-daten-ab-50", ["profil-kommunikation"]).topic, "neustart");
  assert.equal(bannerForArticle("sexualitaet-nach-menopause", ["beziehung-naehe"]).image, "frau");
  assert.equal(bannerForArticle("haarausfall-dating-ab50", ["profil-kommunikation"]).image, "mann");
});

test("categories and unknown articles receive a suitable fallback", () => {
  assert.equal(bannerForArticle("unbekannt", ["sicherheit-vertrauen"]).topic, "vertrauen");
  assert.equal(bannerForArticle("unbekannt", ["beziehung-naehe"]).topic, "naehe");
  assert.equal(bannerForArticle("unbekannt", []).topic, "kennenlernen");
});
