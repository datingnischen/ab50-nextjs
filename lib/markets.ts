import { staticAsset } from "./static-asset.ts";

export type MarketCode = "de" | "ch";
export type Aid = "magazin" | "location";

export type MarketConfig = {
  code: MarketCode;
  countryName: string;
  locale: string;
  siteName: string;
  domain: string;
  homeUrl: string;
  logoSrc: string;
  logoAlt: string;
  iconyProjectKey: string;
};

export const markets: Record<MarketCode, MarketConfig> = {
  de: {
    code: "de",
    countryName: "Deutschland",
    locale: "de-DE",
    siteName: "ab50.de",
    domain: "ab50.de",
    homeUrl: "https://ab50.de/",
    logoSrc: staticAsset("/ab50-logo.png"),
    logoAlt: "ab50.de Logo",
    iconyProjectKey: "ab50de",
  },
  ch: {
    code: "ch",
    countryName: "Schweiz",
    locale: "de-CH",
    siteName: "ab50.ch",
    domain: "ab50.ch",
    homeUrl: "https://ab50.ch/",
    logoSrc: staticAsset("/ab50-ch-logo.svg"),
    logoAlt: "ab50.ch Logo",
    iconyProjectKey: "ab50ch",
  },
};

export function marketFromPathname(pathname: string): MarketCode {
  if (/^\/ch(?:\/|$)/.test(pathname)) return "ch";
  return "de";
}

export function marketFromLocation(pathname: string, hostname?: string): MarketCode {
  const normalizedHost = hostname?.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  if (normalizedHost === "ab50.ch" || normalizedHost === "www.ab50.ch") return "ch";
  if (normalizedHost === "ab50.de" || normalizedHost === "www.ab50.de") return "de";
  return marketFromPathname(pathname);
}

const FILE_PATH_PATTERN = /\/[^/]*\.[a-z0-9]+$/i;

/**
 * Seitenpfade enden immer auf einen Schrägstrich, wie die ICONY-Plattform (/login/, /suche/).
 * Dateien wie /sitemap.xml bleiben ohne. Query und Anker hängen hinter dem Schrägstrich.
 */
export function withTrailingSlash(pathname: string): string {
  const match = pathname.match(/^([^?#]*)(.*)$/);
  const path = match?.[1] ?? pathname;
  const suffix = match?.[2] ?? "";
  if (!path || path.endsWith("/") || FILE_PATH_PATTERN.test(path)) {
    return `${path || "/"}${suffix}`;
  }
  return `${path}/${suffix}`;
}

export function marketPreviewPath(market: MarketCode, href: string) {
  const match = href.match(/^([^?#]*)([?#].*)?$/);
  const pathname = match?.[1] || "/";
  const suffix = match?.[2] || "";
  if (new RegExp(`^/${market}(?:/|$)`).test(pathname)) return withTrailingSlash(`${pathname}${suffix}`);
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withTrailingSlash(`/${market}${normalized === "/" ? "" : normalized}${suffix}`);
}

export function publicMarketUrl(market: MarketCode, pathname = "/") {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `https://${markets[market].domain}${withTrailingSlash(normalized)}`;
}

export function registrationUrl(market: MarketCode, aid: Aid) {
  return `${markets[market].homeUrl}?AID=${aid}`;
}

export function searchUrl(market: MarketCode, aid: Aid = "location") {
  return `${markets[market].homeUrl}suche/?AID=${aid}`;
}

export function marketPartnersuchePath(market: MarketCode, slug?: string) {
  const path = slug ? `/partnersuche/${slug}` : "/partnersuche";
  return {
    publicPath: path,
    publicUrl: publicMarketUrl(market, path),
    previewPath: marketPreviewPath(market, path),
  };
}
