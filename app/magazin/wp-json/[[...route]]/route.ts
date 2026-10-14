import { handleWpRest, wpRestPreflight, wpRestResponse } from "@/lib/wp-rest-compat";
import { isTeaserImageRoute, teaserImageResponse } from "@/lib/teaser-image";

// WordPress-kompatibler REST-Endpunkt (aus data/wp/posts.json), siehe lib/wp-rest-compat.ts.
// Die URL bleibt wie im früheren WordPress: https://ab50.de/magazin/wp-json/wp/v2/posts
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ route?: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { route = [] } = await context.params;
  // Teaserbilder für ICONY ohne Dateiendung (lib/teaser-image.ts)
  if (isTeaserImageRoute(route)) return teaserImageResponse(route, request.method);
  return wpRestResponse(handleWpRest(`/${route.join("/")}`, new URL(request.url).searchParams), request.method);
}

export const HEAD = GET;

export function OPTIONS() {
  return wpRestPreflight();
}
