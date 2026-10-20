import { NextRequest, NextResponse } from "next/server";
import {
  resolveHostRequest,
  resolveMarketResourceRequest,
  resolvePartnersucheRequest,
  resolveTrailingSlashRedirect,
} from "@/lib/market-router";

// Vercel verwirft bei Rewrites Parameter ohne Wert; ICONY ruft "?_embed" ohne Wert auf (WordPress-Schreibweise).
// Hinter nginx kommt der REST-Aufruf mit Upstream-Präfix an und wird umgeschrieben – ohne _embed=1 fehlten die Teaserbilder.
function withEmbedValue(destination: URL) {
  if (destination.searchParams.has("_embed") && destination.searchParams.get("_embed") === "") destination.searchParams.set("_embed", "1");
  return destination;
}

const CH_REST_INTERNAL = /^(?:\/(?:de|ch|at))?\/magazin\/wp-json-ch(?:\/|$)/;

export function proxy(request: NextRequest) {
  // Host is matched against the closed application allowlist before route-specific resolution.
  // X-Forwarded-Host is intentionally ignored because clients can spoof it.
  const requestHost = request.headers.get("host") || request.nextUrl.hostname;
  const hostResolution = resolveHostRequest(requestHost, request.nextUrl.pathname);
  if (hostResolution.action === "not-found") {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  // WordPress-kompatibler REST-Endpunkt für ICONY: ohne Schrägstrich erreichbar, ICONY folgt keiner Weiterleitung.
  const { pathname, searchParams } = request.nextUrl;
  // Interner Pfad des CH-Knotens (app/magazin/wp-json-ch): nur über den Rewrite unten erreichbar.
  if (CH_REST_INTERNAL.test(pathname)) {
    return new NextResponse("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  if (pathname === "/magazin/wp-json" || pathname.startsWith("/magazin/wp-json/") || pathname === "/magazin/index.php") {
    return NextResponse.next();
  }
  if ((pathname === "/magazin" || pathname === "/magazin/") && searchParams.has("rest_route")) {
    const destination = new URL(request.nextUrl.href);
    destination.pathname = "/magazin/index.php";
    return NextResponse.rewrite(withEmbedValue(destination));
  }
  // Länderpfade des WordPress-kompatiblen Endpunkts (/ch/magazin/wp-json/..., /ch/magazin/?rest_route=...):
  // ebenfalls ohne Schrägstrich-Umleitung. nginx stellt ab50.ch-Aufrufen /ch voran; dieser Markt bekommt den
  // CH-Knoten (drei größte Städteseiten, lib/wp-market-teasers.ts) unter dem internen Pfad /magazin/wp-json-ch.
  const restRouteEntry = searchParams.has("rest_route") && /^\/(?:de|ch|at)\/magazin(?:\/index\.php)?\/?$/.test(pathname);
  if (restRouteEntry || /^\/(?:de|ch|at)\/magazin\/(?:wp-json(?:\/.*)?|index\.php)$/.test(pathname)) {
    const rest = resolvePartnersucheRequest(requestHost, pathname);
    if (rest.action === "rewrite") {
      const destination = new URL(request.nextUrl.href);
      if (rest.market === "ch" && (restRouteEntry || !pathname.endsWith("/index.php"))) {
        const route = restRouteEntry ? `/${(searchParams.get("rest_route") || "").replace(/^\/+/, "")}` : rest.destination.replace(/^\/magazin\/(?:wp-json|index\.php)/, "");
        destination.pathname = `/magazin/wp-json-ch${route}`;
        destination.searchParams.delete("rest_route");
      } else {
        destination.pathname = restRouteEntry ? "/magazin/index.php" : rest.destination;
      }
      return NextResponse.rewrite(withEmbedValue(destination));
    }
    return new NextResponse("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  const isMarketResource = /^(?:\/[^/]+)?\/(?:sitemap\.xml|robots\.txt)$/.test(request.nextUrl.pathname);
  const resolution = isMarketResource
    ? resolveMarketResourceRequest(requestHost, request.nextUrl.pathname)
    : resolvePartnersucheRequest(requestHost, request.nextUrl.pathname);

  if (resolution.action === "not-found") {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (resolution.action === "redirect") {
    const destination = new URL(resolution.destination);
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination, 308);
  }

  // Seitenpfade enden immer auf "/". Vor dem Rewrite, damit ab50.ch/partnersuche/zuerich erst auf
  // ab50.ch/partnersuche/zuerich/ springt; interne Präfixpfade gehen absolut auf die Landesdomain.
  const slashRedirect = resolveTrailingSlashRedirect(requestHost, request.nextUrl.pathname);
  if (slashRedirect) {
    if (slashRedirect.absolute) {
      return NextResponse.redirect(`${slashRedirect.destination}${request.nextUrl.search}`, 308);
    }
    // Plain URL statt nextUrl.clone(): NextURL normalisiert den Schrägstrich sonst selbst.
    const destination = new URL(request.nextUrl.href);
    destination.pathname = slashRedirect.destination;
    return NextResponse.redirect(destination, 308);
  }

  if (resolution.action === "pass") return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = resolution.destination;
  return NextResponse.rewrite(withEmbedValue(destination));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|app-assets/|icon.png|apple-icon.png|favicon.ico).*)"],
};
