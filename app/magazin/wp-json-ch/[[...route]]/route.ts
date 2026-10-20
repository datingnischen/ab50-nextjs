import { handleWpRest, wpRestPreflight, wpRestResponse } from "@/lib/wp-rest-compat";
import { isTeaserImageRoute, teaserImageResponse } from "@/lib/teaser-image";

// CH-Knoten der WordPress-kompatiblen Schnittstelle (lib/wp-market-teasers.ts): https://ab50.ch/magazin/wp-json/…
// nginx ruft Vercel mit /ch/magazin/wp-json/… bzw. /ch/magazin/?rest_route=… auf; proxy.ts schreibt intern hierher um.
// Eigener interner Pfad statt Query-Parameter: trennt den CDN-Cache und lässt sich von außen nicht setzen
// (proxy.ts beantwortet direkte Aufrufe von /magazin/wp-json-ch mit 404).
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ route?: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { route = [] } = await context.params;
  if (isTeaserImageRoute(route)) return teaserImageResponse(route, request.method);
  const params = new URL(request.url).searchParams;
  params.delete("rest_route");
  return wpRestResponse(handleWpRest(`/${route.join("/")}`, params, "ch"), request.method);
}

export const HEAD = GET;

export function OPTIONS() {
  return wpRestPreflight();
}
