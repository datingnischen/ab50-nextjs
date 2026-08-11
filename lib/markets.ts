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
    logoSrc: "/ab50-logo.png",
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
    logoSrc: "/ab50-ch-logo.svg",
    logoAlt: "ab50.ch Logo",
    iconyProjectKey: "ab50ch",
  },
};

export function marketFromPathname(pathname: string): MarketCode {
  if (/^\/ch(?:\/|$)/.test(pathname)) return "ch";
  return "de";
}

export function marketPreviewPath(market: MarketCode, href: string) {
  const match = href.match(/^([^?#]*)([?#].*)?$/);
  const pathname = match?.[1] || "/";
  const suffix = match?.[2] || "";
  if (new RegExp(`^/${market}(?:/|$)`).test(pathname)) return `${pathname}${suffix}`;
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${market}${normalized === "/" ? "" : normalized}${suffix}`;
}

export function publicMarketUrl(market: MarketCode, pathname = "/") {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `https://${markets[market].domain}${normalized}`;
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
