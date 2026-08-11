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
    || pathname === "/ab50-ch-logo.svg";

  return isSwissRoute ? { action: "pass", market: "ch" } : { action: "not-found" };
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
      destination: `https://ab50.${hostMarket}${stripMarketPrefix(pathname, hostMarket)}`,
    };
  }

  return {
    action: "rewrite",
    destination: `/${hostMarket}${pathname}`,
    market: hostMarket,
  };
}
