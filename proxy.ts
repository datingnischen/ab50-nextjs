import { NextRequest, NextResponse } from "next/server";
import { resolveHostRequest, resolveMarketResourceRequest, resolvePartnersucheRequest } from "@/lib/market-router";

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
  const isMarketResource = /^(?:\/[^/]+)?\/(?:sitemap\.xml|robots\.txt)$/.test(request.nextUrl.pathname);
  const resolution = isMarketResource
    ? resolveMarketResourceRequest(requestHost, request.nextUrl.pathname)
    : resolvePartnersucheRequest(requestHost, request.nextUrl.pathname);

  if (resolution.action === "pass") return NextResponse.next();
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

  const destination = request.nextUrl.clone();
  destination.pathname = resolution.destination;
  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
