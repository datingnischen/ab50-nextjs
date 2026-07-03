import { cache } from "react";
import { siteConfig } from "@/data/site";

export type WpImage = {
  sourceUrl: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type WpCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  count?: number | null;
};

export type WpAuthor = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
};

export type WpPostCard = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  date?: string | null;
  modified?: string | null;
  content?: string | null;
  featuredImage?: WpImage | null;
  categories?: WpCategory[];
  author?: WpAuthor | null;
};

export type WpPage = {
  id: number;
  title: string;
  slug: string;
  date?: string | null;
  modified?: string | null;
  content?: string | null;
};

export type WpCityStatCard = {
  label?: string | null;
  value?: string | number | null;
  description?: string | null;
};

export type WpCityTip = {
  title?: string | null;
  text?: string | null;
};

export type WpSourceItem = {
  title?: string | null;
  url?: string | null;
  publisher?: string | null;
  date?: string | null;
  note?: string | null;
};

export type WpCityAcf = {
  template_variant?: string | null;
  city_name?: string | null;
  city_region?: string | null;
  city_country?: string | null;
  city_hero_claim?: string | null;
  city_dating_angle?: string | null;
  city_highlight_eyebrow?: string | null;
  city_highlight_title?: string | null;
  city_highlight_text?: string | null;
  city_profile_card_eyebrow?: string | null;
  city_profile_card_title?: string | null;
  city_profile_card_text?: string | null;
  city_sidebar_eyebrow?: string | null;
  city_sidebar_title?: string | null;
  city_sidebar_text?: string | null;
  city_sidebar_cta_label?: string | null;
  city_sidebar_cta_url?: string | null;
  city_cta_eyebrow?: string | null;
  city_cta_title?: string | null;
  city_cta_text?: string | null;
  city_cta_note?: string | null;
  city_trust_eyebrow?: string | null;
  city_trust_points?: string | null;
  city_hero_chips?: string | null;
  flirt_factor_score?: string | number | null;
  flirt_factor_text?: string | null;
  local_stat_cards?: WpCityStatCard[] | null;
  local_tips_eyebrow?: string | null;
  local_tips_title?: string | null;
  local_tips_intro?: string | null;
  local_tips?: WpCityTip[] | null;
  sources_intro?: string | null;
  sources_display_mode?: string | null;
  sources?: WpSourceItem[] | null;
  hero_eyebrow?: string | null;
  hero_title?: string | null;
  hero_lead?: string | null;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_url?: string | null;
  content_reviewed_at?: string | null;
  content_review_note?: string | null;
};

export type WpCity = {
  id: number;
  title: string;
  slug: string;
  date?: string | null;
  modified?: string | null;
  content?: string | null;
  featuredImage?: WpImage | null;
  acf?: WpCityAcf | null;
};

type RestHeaders = Headers;
type RestListResult<T> = { data: T[]; headers: RestHeaders };

export function decodeHtmlEntities(value?: string | null) {
  return (value || "")
    .replace(/&amp;#(x[0-9a-f]+|\d+);/gi, "&#$1;")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (match, entity: string) => {
      const codePoint = entity.toLowerCase().startsWith("x")
        ? Number.parseInt(entity.slice(1), 16)
        : Number.parseInt(entity, 10);
      return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&auml;/gi, (match) => match[1] === "A" ? "Ä" : "ä")
    .replace(/&ouml;/gi, (match) => match[1] === "O" ? "Ö" : "ö")
    .replace(/&uuml;/gi, (match) => match[1] === "U" ? "Ü" : "ü")
    .replace(/&szlig;/gi, "ß")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "’")
    .replace(/&#8222;/g, "„")
    .replace(/&#8220;/g, "“")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "…");
}

export function stripHtml(value?: string | null) {
  return decodeHtmlEntities(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function postPath(slug: string) {
  return `/magazin/${slug}`;
}

export function pagePath(slug: string) {
  return `/magazin/${slug}`;
}

export function categoryPath(slug: string) {
  return `/magazin/kategorie/${slug}`;
}

export function cityPath(slug: string) {
  return `/partnersuche/${slug}/`;
}

export function normalizeCitySlug(slug: string) {
  return decodeURIComponent(slug)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function normalizeImage(raw: any): WpImage | null {
  if (!raw?.source_url) return null;
  return {
    sourceUrl: raw.source_url,
    altText: raw.alt_text || null,
    width: raw.media_details?.width || null,
    height: raw.media_details?.height || null,
  };
}

function normalizeTerms(raw: any): WpCategory[] {
  const groups = Array.isArray(raw?._embedded?.["wp:term"]) ? raw._embedded["wp:term"] : [];
  const flat = groups.flatMap((group: any) => Array.isArray(group) ? group : []);
  return flat
    .filter((term: any) => term?.taxonomy === "category")
    .map((term: any) => ({
      id: term.id,
      name: decodeHtmlEntities(term.name),
      slug: term.slug,
      description: stripHtml(term.description || "") || null,
      count: term.count ?? null,
    }));
}

function normalizeAuthor(raw: any): WpAuthor | null {
  const author = Array.isArray(raw?._embedded?.author) ? raw._embedded.author[0] : null;
  if (!author) return null;
  return {
    name: decodeHtmlEntities(author.name || author.slug || ""),
    slug: author.slug || null,
    description: author.description || null,
  };
}

function normalizePost(raw: any): WpPostCard {
  const media = Array.isArray(raw?._embedded?.["wp:featuredmedia"]) ? raw._embedded["wp:featuredmedia"][0] : null;
  return {
    id: raw.id,
    title: decodeHtmlEntities(raw?.title?.rendered || ""),
    slug: raw.slug,
    excerpt: raw?.excerpt?.rendered || null,
    date: raw.date || null,
    modified: raw.modified || null,
    content: raw?.content?.rendered || null,
    featuredImage: normalizeImage(media),
    categories: normalizeTerms(raw),
    author: normalizeAuthor(raw),
  };
}

function normalizePage(raw: any): WpPage {
  return {
    id: raw.id,
    title: decodeHtmlEntities(raw?.title?.rendered || ""),
    slug: raw.slug,
    date: raw.date || null,
    modified: raw.modified || null,
    content: raw?.content?.rendered || null,
  };
}

function normalizeCity(raw: any): WpCity {
  const media = Array.isArray(raw?._embedded?.["wp:featuredmedia"]) ? raw._embedded["wp:featuredmedia"][0] : null;
  const acf = raw?.acf && typeof raw.acf === "object" && !Array.isArray(raw.acf) ? raw.acf : null;
  return {
    id: raw.id,
    title: decodeHtmlEntities(raw?.title?.rendered || raw?.title?.raw || ""),
    slug: raw.slug,
    date: raw.date || null,
    modified: raw.modified || null,
    content: raw?.content?.rendered || raw?.content?.raw || null,
    featuredImage: normalizeImage(media),
    acf,
  };
}

async function wpRest<T>(path: string, params: Record<string, string | number | boolean> = {}): Promise<RestListResult<T>> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
  const url = `${siteConfig.wordpressRestEndpoint}${path}${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Amigo ab50 Next.js/Vercel Magazin" },
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`WP REST request failed: ${response.status} ${response.statusText} for ${url}`);
  }
  const data = await response.json() as T[];
  return { data, headers: response.headers };
}

async function collectPaged<T>(path: string, params: Record<string, string | number | boolean> = {}) {
  const first = await wpRest<T>(path, { ...params, page: 1, per_page: 100 });
  const totalPages = Number(first.headers.get("x-wp-totalpages") || 1);
  const combined = [...first.data];
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await wpRest<T>(path, { ...params, page, per_page: 100 });
    combined.push(...next.data);
  }
  return combined;
}

export const getLatestPosts = cache(async (first = 24) => {
  const { data } = await wpRest<any>("/posts", {
    per_page: first,
    page: 1,
    _embed: 1,
    orderby: "date",
    order: "desc",
  });
  return data.map(normalizePost);
});

export const getPostBySlug = cache(async (slug: string) => {
  const { data } = await wpRest<any>("/posts", { slug, _embed: 1, per_page: 1 });
  return data[0] ? normalizePost(data[0]) : null;
});

export const getPageBySlug = cache(async (slug: string) => {
  const { data } = await wpRest<any>("/pages", { slug, per_page: 1 });
  return data[0] ? normalizePage(data[0]) : null;
});

export const getAllPostSlugs = cache(async () => {
  const posts = await collectPaged<any>("/posts", { _fields: "slug" });
  return posts.map((post) => post.slug).filter(Boolean);
});

export const getAllPageSlugs = cache(async () => {
  const pages = await collectPaged<any>("/pages", { _fields: "slug" });
  return pages.map((page) => page.slug).filter(Boolean);
});

export const getAllPages = cache(async () => {
  const pages = await collectPaged<any>("/pages");
  return pages.map(normalizePage);
});

export const getCategories = cache(async (first = 24) => {
  const { data } = await wpRest<any>("/categories", {
    per_page: first,
    page: 1,
    hide_empty: true,
    orderby: "count",
    order: "desc",
  });
  return data.map((category) => ({
    id: category.id,
    name: decodeHtmlEntities(category.name),
    slug: category.slug,
    description: stripHtml(category.description || "") || null,
    count: category.count ?? null,
  })) as WpCategory[];
});

export const getPostsByCategory = cache(async (slug: string, first = 18) => {
  const { data: categoryData } = await wpRest<any>("/categories", { slug, per_page: 1, hide_empty: true });
  const category = categoryData[0];
  if (!category) return null;
  const { data: postData } = await wpRest<any>("/posts", {
    categories: category.id,
    per_page: first,
    page: 1,
    _embed: 1,
    orderby: "date",
    order: "desc",
  });
  return {
    id: category.id,
    name: decodeHtmlEntities(category.name),
    slug: category.slug,
    description: stripHtml(category.description || "") || null,
    count: category.count ?? null,
    posts: postData.map(normalizePost),
  };
});

export const getAllCities = cache(async () => {
  const cities = await collectPaged<any>("/stadt", {
    _embed: 1,
    status: "publish",
    orderby: "title",
    order: "asc",
  });
  return cities.map(normalizeCity);
});

export const getCityByPublicSlug = cache(async (publicSlug: string) => {
  const normalizedSlug = normalizeCitySlug(publicSlug);
  const { data } = await wpRest<any>("/stadt", {
    slug: normalizedSlug,
    _embed: 1,
    per_page: 1,
    status: "publish",
  });
  return data[0] ? normalizeCity(data[0]) : null;
});

export const getAllPublicCitySlugs = cache(async () => {
  const response = await fetch(`${siteConfig.links.home.replace(/\/$/, "")}/sitemap.php`, {
    headers: { "User-Agent": "Amigo ab50 Next.js/Vercel Cities" },
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    return [] as string[];
  }
  const xml = await response.text();
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g))
    .map((match) => match[1])
    .filter((url) => {
      try {
        const parsed = new URL(url);
        return parsed.pathname.startsWith("/partnersuche/") && parsed.pathname !== "/partnersuche/";
      } catch {
        return false;
      }
    })
    .map((url) => {
      const parsed = new URL(url);
      return decodeURIComponent(parsed.pathname.replace(/^\/partnersuche\//, "").replace(/\/$/, ""));
    });
});
