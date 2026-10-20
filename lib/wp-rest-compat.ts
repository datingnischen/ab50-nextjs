import categoriesData from "../data/wp/categories.json" with { type: "json" };
import postsData from "../data/wp/posts.json" with { type: "json" };

import { teaserImageUrl } from "./teaser-image.ts";
import { loadMarketTeaserPosts, type MarketTeaserCode } from "./wp-market-teasers.ts";
/**
 * WordPress-kompatibler REST-Endpunkt für die Magazin-BEITRÄGE, erzeugt aus data/wp/posts.json.
 *
 * ICONY liest auf den Plattform-Startseiten Magazin-Teaser über <Domain>/magazin/wp-json/wp/v2/posts. WordPress ist
 * abgelöst, der Endpunkt bleibt: gleiche URL, gleiche Felder. Bewusst NICHT vorhanden: /wp/v2/users, /pages, /stadt
 * (404). `author` ist nur die ID, `_embedded.author` wird nie ausgegeben.
 */

export const WP_REST_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type",
  "Access-Control-Expose-Headers": "X-WP-Total, X-WP-TotalPages, Link",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  "X-Robots-Tag": "noindex",
  "X-Content-Type-Options": "nosniff",
  Allow: "GET",
};

export type WpRestResponse = { status: number; body: unknown; headers: Record<string, string> };

type Json = Record<string, any>;

const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;
const NAMESPACE_ROUTES = ["/wp/v2/posts", "/wp/v2/categories"];

const posts = (postsData as Json[]).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
const categories = categoriesData as Json[];

/** Datenquelle je Domain: ab50.de = Magazinbeiträge, ab50.ch = drei größte Städteseiten (lib/wp-market-teasers.ts). */
type WpSource = { posts: Json[]; categories: Json[]; home: string; restRoot: string };

const DE_SOURCE: WpSource = { posts, categories, home: "https://ab50.de", restRoot: "https://ab50.de/magazin/wp-json" };

function sourceFor(market?: MarketTeaserCode): WpSource {
  if (market === "ch") return { posts: loadMarketTeaserPosts("ch"), categories: [], home: "https://ab50.ch", restRoot: "https://ab50.ch/magazin/wp-json" };
  return DE_SOURCE;
}

function error(status: number, code: string, message: string): WpRestResponse {
  return { status, body: { code, message, data: { status } }, headers: {} };
}

const NO_ROUTE = () => error(404, "rest_no_route", "Es wurde keine Route gefunden, die der URL und der Anfragemethode entspricht.");

function positiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? Math.min(parsed, max) : fallback;
}

/**
 * Beitragsbild wie bei WordPress: ICONY liest `_embedded["wp:featuredmedia"][0].media_details.sizes` (Heiko, 2026-10-14).
 * Der Snapshot kennt nur source_url, Breite und Höhe – daraus entsteht eine Größenliste (medium/large/full zeigen auf
 * dieselbe Datei). source_url bleibt auf der eigenen Domain (https://ab50.de/magazin/wp-content/uploads/…), weil die
 * ICONY-Startseite Bilder nur von dort laden darf (CSP); nginx muss diesen Pfad an Vercel durchreichen.
 */
function withImageSizes(media: Json, restRoot: string): Json {
  const details = (media.media_details && typeof media.media_details === "object" ? media.media_details : {}) as Json;
  const existing = details.sizes && typeof details.sizes === "object" && !Array.isArray(details.sizes) ? (details.sizes as Json) : {};
  if (typeof media.source_url !== "string") return media;
  const sourceUrl = teaserImageUrl(restRoot, media.source_url);
  if (Object.keys(existing).length) {
    const sizes = Object.fromEntries(Object.entries(existing).map(([name, size]) => [name, { ...(size as Json), source_url: teaserImageUrl(restRoot, String((size as Json).source_url ?? media.source_url)) }]));
    return { ...media, source_url: sourceUrl, media_details: { ...details, sizes } };
  }
  const file = media.source_url.split("/").pop() ?? "";
  const mime = typeof media.mime_type === "string" && media.mime_type
    ? media.mime_type
    : /\.webp$/i.test(file) ? "image/webp" : /\.png$/i.test(file) ? "image/png" : "image/jpeg";
  const size = { file, width: details.width ?? 0, height: details.height ?? 0, mime_type: mime, source_url: sourceUrl };
  return { ...media, mime_type: mime, media_type: media.media_type ?? "image", source_url: sourceUrl, media_details: { ...details, file, sizes: Object.fromEntries(["thumbnail", "medium", "medium_large", "large", "full"].map((name) => [name, size])) } };
}

function postObject(post: Json, embed: boolean, restRoot: string): Json {
  const { _embedded, _links, ...rest } = post;
  if (!embed) return rest;
  const { author: _author, ...embedded } = (_embedded || {}) as Json;
  const { author: _authorLink, ...links } = (_links || {}) as Json;
  const featured = embedded["wp:featuredmedia"];
  if (Array.isArray(featured)) embedded["wp:featuredmedia"] = featured.map((media) => withImageSizes(media as Json, restRoot));
  return { ...rest, _links: links, _embedded: embedded };
}

function applyFields(row: Json, params: URLSearchParams): Json {
  const fields = (params.get("_fields") || "").split(",").map((field) => field.trim()).filter(Boolean);
  if (!fields.length) return row;
  return Object.fromEntries(Object.entries(row).filter(([key]) => fields.includes(key) || (key === "_embedded" && fields.includes("_embedded"))));
}

function collection(rows: Json[], params: URLSearchParams, make: (row: Json) => Json): WpRestResponse {
  const perPage = positiveInt(params.get("per_page"), DEFAULT_PER_PAGE, MAX_PER_PAGE);
  const page = positiveInt(params.get("page"), 1);
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const headers = { "X-WP-Total": String(rows.length), "X-WP-TotalPages": String(totalPages) };
  if (page > totalPages && rows.length) {
    return { ...error(400, "rest_post_invalid_page_number", "Die angeforderte Seitenzahl ist größer als die Anzahl der verfügbaren Seiten."), headers };
  }
  const slice = rows.slice((page - 1) * perPage, page * perPage).map((row) => applyFields(make(row), params));
  return { status: 200, body: slice, headers };
}

function postCollection(params: URLSearchParams, source: WpSource): WpRestResponse {
  let rows = source.posts;
  const slug = params.get("slug");
  if (slug) rows = rows.filter((post) => slug.split(",").includes(post.slug));
  const ids = (params.get("categories") || "").split(",").map(Number).filter(Boolean);
  if (ids.length) rows = rows.filter((post) => ids.some((id) => (post.categories || []).includes(id)));
  if (params.get("order") === "asc") rows = rows.slice().reverse();
  const embed = params.has("_embed");
  return collection(rows, params, (post) => postObject(post, embed, source.restRoot));
}

export function handleWpRest(route: string, params: URLSearchParams, market?: MarketTeaserCode): WpRestResponse {
  const source = sourceFor(market);
  const parts = route.split("/").filter(Boolean);

  if (!parts.length) {
    return {
      status: 200,
      body: {
        name: "50plus Magazin",
        description: "",
        url: source.home,
        home: source.home,
        namespaces: ["wp/v2"],
        authentication: {},
        routes: Object.fromEntries(NAMESPACE_ROUTES.map((path) => [path, { namespace: "wp/v2", methods: ["GET"] }])),
      },
      headers: {},
    };
  }

  if (parts[0] !== "wp" || parts[1] !== "v2") return NO_ROUTE();
  if (parts.length === 2) return { status: 200, body: { namespace: "wp/v2", routes: NAMESPACE_ROUTES }, headers: {} };

  const [, , resource, idPart] = parts;
  if (parts.length > 4) return NO_ROUTE();

  if (resource === "posts") {
    if (!idPart) return postCollection(params, source);
    const post = /^\d+$/.test(idPart) ? source.posts.find((item) => item.id === Number(idPart)) : undefined;
    if (!post) return error(404, "rest_post_invalid_id", "Ungültige Beitrags-ID.");
    return { status: 200, body: applyFields(postObject(post, params.has("_embed"), source.restRoot), params), headers: {} };
  }

  if (resource === "categories") {
    const visible = source.categories.filter((category) => (category.count ?? 0) > 0);
    if (!idPart) return collection(visible, params, (category) => category);
    const row = /^\d+$/.test(idPart) ? visible.find((item) => item.id === Number(idPart)) : undefined;
    if (!row) return error(404, "rest_term_invalid", "Begriff existiert nicht.");
    return { status: 200, body: applyFields(row, params), headers: {} };
  }

  return NO_ROUTE();
}

export function wpRestResponse(result: WpRestResponse, method = "GET"): Response {
  const headers = new Headers({ ...WP_REST_HEADERS, ...result.headers });
  if (result.status >= 400) headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
  return new Response(method === "HEAD" ? null : JSON.stringify(result.body), { status: result.status, headers });
}

export function wpRestPreflight(): Response {
  const headers = new Headers(WP_REST_HEADERS);
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}
