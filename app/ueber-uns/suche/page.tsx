import type { Metadata } from "next";
import { MarketLink } from "@/components/market-link";
import { SiteSearchForm } from "@/components/site-search-form";
import { AboutSubnav, LightHero } from "@/components/ab-info/info-parts";
import { ArrowIcon, SearchIcon } from "@/components/ab-icons";
import { swissPartnersuche, swissCityPath } from "@/lib/ch-partnersuche";
import { cityCardCopy } from "@/lib/city-card-copy";
import { marketPreviewPath, publicMarketUrl } from "@/lib/markets";
import { ABOUT_HISTORY_PATH, ABOUT_REVIEWS_PATH, ABOUT_ROOT_PATH, ABOUT_SOCIAL_PATH } from "@/lib/about-pages";
import { SITE_SEARCH_MAX_RESULTS, SITE_SEARCH_PATH, searchDocuments, shortExcerpt, type SiteSearchDocument } from "@/lib/site-search";
import {
  categoryPath,
  cityPath,
  getAllCities,
  getAllPublicCitySlugs,
  getCategories,
  getSearchablePages,
  getSearchablePosts,
  normalizeCitySlug,
  pagePath,
  postPath,
  stripHtml,
} from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Suche",
  description: "Durchsuche das 50plus Magazin und die Stadtseiten von ab50.de.",
  alternates: { canonical: SITE_SEARCH_PATH },
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

const aboutDocuments: SiteSearchDocument[] = [
  { area: "Über uns", title: "Über ab50.de", excerpt: "Hintergründe, Social Media und Bewertungen rund um ab50.de auf einen Blick.", text: "ICONY Christian M. Haas", href: ABOUT_ROOT_PATH },
  { area: "Über uns", title: "Unsere Geschichte", excerpt: "Wie sich ab50.de seit 2011 entwickelt hat – mit ausgewählten Wayback-Snapshots der Plattform.", href: ABOUT_HISTORY_PATH },
  { area: "Über uns", title: "Social Media", excerpt: "Facebook, YouTube und Community: Videos zu Dating, Tipps und Erfolgsgeschichten.", href: ABOUT_SOCIAL_PATH },
  { area: "Über uns", title: "Bewertungen & Erfahrungen", excerpt: "Trustpilot-Bewertungen, Feedback und Erfahrungsberichte echter Nutzer.", text: "Erfahrungen Test Vergleich", href: ABOUT_REVIEWS_PATH },
];

function safeCardCopy(market: "de" | "ch", slug: string) {
  try {
    return cityCardCopy(market, slug);
  } catch {
    return "";
  }
}

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

async function loadDocuments(): Promise<SiteSearchDocument[]> {
  // Alles aus den gecachten Listen-Helfern (Fetch-Cache 300 s) – kein eigener WordPress-Request pro Suchanfrage.
  const [postsResult, pagesResult, categoriesResult, citiesResult, publicSlugsResult] = await Promise.allSettled([
    getSearchablePosts(),
    getSearchablePages(),
    getCategories(50),
    getAllCities(),
    getAllPublicCitySlugs(),
  ]);

  const posts = settled(postsResult, []);
  const pages = settled(pagesResult, []);
  const categories = settled(categoriesResult, []);
  const cities = settled(citiesResult, []);
  const publicSlugMap = new Map(settled(publicSlugsResult, []).map((slug) => [normalizeCitySlug(slug), slug]));

  const deCities: SiteSearchDocument[] = cities.map((city) => {
    const publicSlug = publicSlugMap.get(city.slug) || city.slug;
    const cityName = city.acf?.city_name || "";
    const cardCopy = safeCardCopy("de", city.slug);
    const content = stripHtml(city.content);
    return {
      area: "Stadt",
      title: cityName ? `Singles ab 50 aus ${cityName}` : stripHtml(city.title),
      excerpt: shortExcerpt(cardCopy || content),
      text: `${stripHtml(city.title)} ${cityName} ${content.slice(0, 4000)}`,
      href: cityPath(publicSlug),
    };
  });

  const chCities: SiteSearchDocument[] = swissPartnersuche.cities.map((city) => {
    const path = swissCityPath(city.slug);
    return {
      area: "Stadt · Schweiz",
      title: city.title || `Singles ab 50 aus ${city.name}`,
      excerpt: shortExcerpt(safeCardCopy("ch", city.slug) || city.description || stripHtml(city.contentHtml)),
      text: `${city.name} Schweiz ${stripHtml(city.contentHtml).slice(0, 4000)}`,
      href: publicMarketUrl("ch", path),
      previewHref: marketPreviewPath("ch", path),
    };
  });

  return [
    ...posts.map((post) => ({ area: "Magazin", title: post.title, excerpt: shortExcerpt(post.excerpt), href: postPath(post.slug) })),
    ...deCities,
    ...chCities,
    ...categories.map((category) => ({
      area: "Magazin-Thema",
      title: category.name,
      excerpt: shortExcerpt(category.description || `Alle Artikel zum Thema ${category.name} im 50plus Magazin.`),
      href: categoryPath(category.slug),
    })),
    ...pages.map((page) => ({ area: "Magazin", title: page.title, excerpt: shortExcerpt(page.excerpt), href: pagePath(page.slug) })),
    ...aboutDocuments,
  ];
}

export default async function SiteSearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (rawQuery || "").trim().slice(0, 100);
  const results = query ? searchDocuments(await loadDocuments(), query, SITE_SEARCH_MAX_RESULTS) : [];

  return (
    <article className="abi site-search-page">
      <LightHero
        crumbs={[{ label: "Magazin", href: "/magazin/" }, { label: "Über uns", href: "/ueber-uns/" }, { label: "Suche" }]}
        eyebrow={<><SearchIcon />Über ab50.de · Suche</>}
        title={query ? `Suche nach „${query}“` : "Was suchst du?"}
        lead="Durchsuche Magazin-Artikel, Themen und Stadtseiten für Singles ab 50."
      >
        <div className="abi-search">
          <SiteSearchForm query={query} label="Suchbegriff" autoFocus={!query} />
        </div>
      </LightHero>

      <AboutSubnav current={SITE_SEARCH_PATH} />

      <section className="ab-wrap ab-section">
        {!query ? (
          <div className="abi-empty">
            <p className="ab-eyebrow">So funktioniert’s</p>
            <h2>Gib einfach ein Stichwort ein</h2>
            <p>Zum Beispiel deine Stadt, ein Thema wie „Profil“ oder „Sicherheit“ oder eine Frage, die dich gerade beschäftigt. Umlaute kannst du schreiben, wie du magst – „Köln“ und „Koeln“ finden dasselbe.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="abi-empty">
            <p className="ab-eyebrow">Keine Treffer</p>
            <h2>Dazu haben wir leider nichts gefunden</h2>
            <p>Versuch es mit einem kürzeren oder anderen Begriff. Oder stöbere direkt weiter:</p>
            <div className="abi-hero-actions">
              <a className="ab-btn ab-btn-primary" href="/magazin/">Zum 50plus Magazin</a>
              <a className="ab-btn ab-btn-outline" href="/partnersuche/">Stadtseiten ansehen</a>
            </div>
          </div>
        ) : (
          <>
            <p className="abi-count" aria-live="polite">
              {results.length === 1 ? "1 Treffer" : `${results.length}${results.length >= SITE_SEARCH_MAX_RESULTS ? "+" : ""} Treffer`}
            </p>
            <ol className="abi-results">
              {results.map((result) => {
                const inner = (
                  <>
                    <span className="abi-area">{result.area}</span>
                    <strong>{result.title}</strong>
                    {result.excerpt ? <span className="abi-result-excerpt">{result.excerpt}</span> : null}
                    <em>Öffnen <ArrowIcon /></em>
                  </>
                );
                return (
                  <li key={result.href}>
                    {result.previewHref ? (
                      <MarketLink className="abi-result" href={result.href} previewHref={result.previewHref}>{inner}</MarketLink>
                    ) : (
                      <a className="abi-result" href={result.href}>{inner}</a>
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </section>
    </article>
  );
}
