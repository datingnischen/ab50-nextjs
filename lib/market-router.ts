import { publicMarketUrl, withTrailingSlash } from "./markets.ts";

export type RouteMarket = "de" | "ch";

export type PartnersucheResolution =
  | { action: "pass"; market?: RouteMarket }
  | { action: "rewrite"; destination: string; market: RouteMarket }
  | { action: "redirect"; destination: string }
  | { action: "not-found" };

const countryHosts: Record<string, RouteMarket> = {
  "ab50.de": "de",
  "www.ab50.de": "de",
  "ab50.ch": "ch",
  "www.ab50.ch": "ch",
};

function normalizeHostname(hostname: string) {
  return hostname.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

function isPreviewHost(hostname: string) {
  return hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "::1"
    || hostname.endsWith(".vercel.app");
}

export function resolveHostRequest(hostnameInput: string, pathname: string): PartnersucheResolution {
  const hostname = normalizeHostname(hostnameInput);
  if (isPreviewHost(hostname)) return { action: "pass" };

  const hostMarket = countryHosts[hostname];
  if (!hostMarket) return { action: "not-found" };
  if (hostMarket === "de") return { action: "pass", market: "de" };

  const isSwissRoute = pathname === "/partnersuche"
    || pathname.startsWith("/partnersuche/")
    || pathname === "/ch/partnersuche"
    || pathname.startsWith("/ch/partnersuche/")
    || pathname === "/sitemap.xml"
    || pathname === "/robots.txt"
    || pathname === "/ch/sitemap.xml"
    || pathname === "/ch/robots.txt"
    || pathname === "/ab50-ch-logo.svg"
    || isCityArtAsset(pathname);

  return isSwissRoute ? { action: "pass", market: "ch" } : { action: "not-found" };
}

/** Vorgerenderte Stadtgrafiken, streng auf Slug-Dateinamen begrenzt. */
function isCityArtAsset(pathname: string) {
  return /^\/stadtbild\/[a-z0-9-]+-(card|thumb)\.svg$/.test(pathname);
}

function prefixedMarket(pathname: string): RouteMarket | "unsupported" | null {
  const match = pathname.match(/^\/([^/]+)\/partnersuche(?:\/|$)/);
  if (!match) return null;
  if (match[1] === "de" || match[1] === "ch") return match[1];
  return "unsupported";
}

function isPrefixFreePartnersuche(pathname: string) {
  return pathname === "/partnersuche" || pathname.startsWith("/partnersuche/");
}

function stripMarketPrefix(pathname: string, market: RouteMarket) {
  const stripped = pathname.replace(new RegExp(`^/${market}(?=/|$)`), "");
  return stripped || "/";
}

export function resolveMarketResourceRequest(hostnameInput: string, pathname: string): PartnersucheResolution {
  const hostname = normalizeHostname(hostnameInput);
  const rootResource = pathname === "/sitemap.xml" || pathname === "/robots.txt";
  const prefixed = pathname.match(/^\/(de|ch)\/(sitemap\.xml|robots\.txt)$/);
  const unsupported = /^\/[^/]+\/(?:sitemap\.xml|robots\.txt)$/.test(pathname) && !prefixed;
  if (!rootResource && !prefixed && !unsupported) return { action: "pass" };

  if (isPreviewHost(hostname)) {
    if (unsupported) return { action: "not-found" };
    const market = prefixed?.[1] as RouteMarket | undefined;
    return market ? { action: "pass", market } : { action: "pass", market: "de" };
  }

  const hostMarket = countryHosts[hostname];
  if (!hostMarket) return { action: "not-found" };
  if (unsupported) return { action: "not-found" };
  const prefix = prefixed?.[1] as RouteMarket | undefined;
  if (prefix && prefix !== hostMarket) return { action: "not-found" };
  if (prefix === hostMarket) {
    return {
      action: "redirect",
      destination: `https://ab50.${hostMarket}/${prefixed?.[2]}`,
    };
  }
  if (hostMarket === "de") return { action: "pass", market: "de" };
  return {
    action: "rewrite",
    destination: `/ch${pathname}`,
    market: "ch",
  };
}

export function resolvePartnersucheRequest(hostnameInput: string, pathname: string): PartnersucheResolution {
  const hostname = normalizeHostname(hostnameInput);
  const prefix = prefixedMarket(pathname);
  const isPartnersuche = isPrefixFreePartnersuche(pathname) || prefix !== null;
  if (!isPartnersuche) return { action: "pass" };

  if (isPreviewHost(hostname)) {
    if (prefix === "unsupported") return { action: "not-found" };
    if (prefix === "de" || prefix === "ch") return { action: "pass", market: prefix };
    return { action: "pass", market: "de" };
  }

  const hostMarket = countryHosts[hostname];
  if (!hostMarket) return { action: "not-found" };
  if (prefix === "unsupported") return { action: "not-found" };
  if (prefix && prefix !== hostMarket) return { action: "not-found" };

  if (prefix === hostMarket) {
    return {
      action: "redirect",
      destination: publicMarketUrl(hostMarket, stripMarketPrefix(pathname, hostMarket)),
    };
  }

  return {
    action: "rewrite",
    destination: `/${hostMarket}${pathname}`,
    market: hostMarket,
  };
}

const NO_SLASH_PREFIXES = ["/_next/", "/app-assets/", "/api/", "/.well-known/"];

export type TrailingSlashRedirect = { destination: string; absolute: boolean };

/**
 * Seitenpfade enden immer auf "/" (wie ICONY /login/, /suche/). Ersetzt die eingebaute Umleitung von
 * Next.js (skipTrailingSlashRedirect): Die kennt nur den Upstream-Pfad. Pfade mit internem Marktpräfix
 * (/ch/partnersuche/..., /de/partnersuche/...) gehen absolut auf die öffentliche Landesdomain ohne
 * Präfix, alles andere relativ auf denselben Host. Dateien, /_next/, /app-assets/ bleiben unberührt.
 */
export function resolveTrailingSlashRedirect(hostnameInput: string, pathname: string): TrailingSlashRedirect | null {
  if (
    pathname.endsWith("/")
    || withTrailingSlash(pathname) === pathname
    || NO_SLASH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return null;
  }

  const target = withTrailingSlash(pathname);
  const marketMatch = target.match(/^\/(de|ch)(\/.*)$/);
  if (!marketMatch) return { destination: target, absolute: false };

  const market = marketMatch[1] as RouteMarket;
  const hostMarket = countryHosts[normalizeHostname(hostnameInput)];
  // Fremdes Marktpräfix auf einer Landesdomain: kein Sprung auf die andere Domain, der Router antwortet 404.
  if (hostMarket && hostMarket !== market) return null;
  return { destination: publicMarketUrl(market, marketMatch[2]), absolute: true };
}
