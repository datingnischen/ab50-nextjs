import Image from "next/image";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { cityPath, getAllCities, getAllPublicCitySlugs, normalizeCitySlug, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { cityCardCopy } from "@/lib/city-card-copy";
import { buildMap, cityGeo } from "@/lib/city-geo";
import { marketPreviewPath } from "@/lib/markets";
import { CitySearchFallback } from "@/components/city-search-fallback";
import { CityFilter } from "@/components/ab-city/city-filter";
import { CountryMap } from "@/components/ab-city/country-map";
import { CtaBand } from "@/components/ab-city/city-parts";
import { HeartIcon, PinIcon } from "@/components/ab-icons";
import "@/components/ab-city/ab-overview.css";

export const metadata: Metadata = {
  title: "Partnersuche ab 50 in deiner Stadt",
  description: "Stadtseiten für Singles ab 50: regionale Orientierung, Dating-Inhalte und lokale Einstiege aus dem ab50.de Magazin.",
  alternates: { canonical: "/partnersuche/" },
  openGraph: {
    title: "Partnersuche ab 50 in deiner Stadt",
    description: "Stadtseiten für Singles ab 50: regionale Orientierung, Dating-Inhalte und lokale Einstiege aus dem ab50.de Magazin.",
    url: absoluteUrl("/partnersuche/"),
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
  },
};

function buildPublicSlugMap(citySlugs: string[]) {
  return new Map(citySlugs.map((slug) => [normalizeCitySlug(slug), slug]));
}

function score(value?: string | number | null) {
  const numeric = Number(String(value ?? "").replace(",", "."));
  return value === null || value === undefined || value === "" || !Number.isFinite(numeric) ? null : numeric;
}

export default async function PartnersucheOverviewPage() {
  const [cities, publicCitySlugs] = await Promise.all([getAllCities(), getAllPublicCitySlugs()]);
  const publicSlugMap = buildPublicSlugMap(publicCitySlugs);
  const entries = cities.map((city) => {
    const publicSlug = publicSlugMap.get(city.slug) || city.slug;
    const name = city.acf?.city_name || stripHtml(city.title);
    return { city, publicSlug, name, geo: cityGeo("de", city.slug), score: score(city.acf?.flirt_factor_score) };
  });
  const regions = [...new Set(entries.map((entry) => entry.geo?.region).filter((region): region is string => Boolean(region)))].sort((a, b) => a.localeCompare(b, "de"));
  const map = buildMap("de", entries.map((entry) => ({
    key: entry.city.slug,
    slug: entry.city.slug,
    name: entry.name,
    href: cityPath(entry.publicSlug),
    previewHref: marketPreviewPath("de", cityPath(entry.publicSlug)),
  })));

  return (
    <section className="abm city-overview-page">
      <div className="ab-hero abm-hero">
        <div className="ab-wrap abm-hero-grid">
          <div>
            <nav className="ab-crumbs" aria-label="Brotkrumen">
              <a href="https://ab50.de/">Start</a>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Partnersuche</span>
            </nav>
            <span className="ab-badge"><HeartIcon />Partnersuche ab 50 · Deutschland</span>
            <h1>Singles ab 50 in deiner Stadt finden</h1>
            <p className="ab-lead">Hier findest du unsere regionalen Stadtseiten für Menschen, die neue Kontakte, Gespräche und echte Begegnungen in ihrer Nähe suchen.</p>
            <ul className="ab-chips">
              <li><strong>{entries.length}</strong> Städte</li>
              <li><strong>{regions.length}</strong> Bundesländer</li>
              <li>Mit Flirt-Faktor und Date-Orten</li>
            </ul>
            <div className="ab-actions">
              <a className="ab-btn ab-btn-primary" href={siteConfig.links.registrationLocation}>Kostenlos starten</a>
              <a className="ab-btn ab-btn-ghost" href="#staedte">Deine Stadt finden ↓</a>
            </div>
          </div>
          <CountryMap id="de" label="Karte: Stadtseiten für Singles ab 50 in Deutschland" map={map} />
        </div>
      </div>

      <div id="staedte" className="ab-wrap abm-panel-wrap">
        <div className="abm-panel">
          <div className="ab-head">
            <p className="ab-eyebrow"><PinIcon />Städte im Überblick</p>
            <h2>Unsere regionalen Seiten</h2>
            <p>Jede Stadtseite zeigt, wer in deiner Nähe gerade sucht – dazu Flirt-Faktor, konkrete Date-Orte und Tipps fürs erste Treffen.</p>
          </div>
          <CityFilter regions={regions} regionLabel="Bundesland" total={entries.length}>
            <div className="post-grid abm-grid">
              {entries.map(({ city, publicSlug, name, geo, score: cityScore }) => (
                <a className="post-card city-overview-card" href={cityPath(publicSlug)} key={city.slug} data-city={name} data-region={geo?.region || ""}>
                  <span className="abm-card-media">
                    {city.featuredImage?.sourceUrl ? (
                      <Image
                        src={city.featuredImage.sourceUrl}
                        alt={city.featuredImage.altText || city.title}
                        width={city.featuredImage.width || 900}
                        height={city.featuredImage.height || 600}
                        className="post-card-image"
                        sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"
                      />
                    ) : (
                      <span className="post-card-placeholder" />
                    )}
                    {geo ? <span className="abm-card-region"><PinIcon />{geo.region}</span> : null}
                    {cityScore !== null ? <span className="abm-card-score" title="Flirt-Faktor">{Math.round(cityScore)}</span> : null}
                  </span>
                  <div className="post-card-body">
                    <span>Regionale Partnersuche</span>
                    <strong>{city.acf?.city_name ? `Singles ab 50 aus ${city.acf.city_name}` : stripHtml(city.title)}</strong>
                    <p>{cityCardCopy("de", city.slug)}</p>
                    <em className="card-read-more city-card-button">Stadtseite ansehen</em>
                  </div>
                </a>
              ))}
            </div>
          </CityFilter>
          <div className="abm-fallback">
            <CitySearchFallback market="de" />
          </div>
        </div>
      </div>

      <CtaBand
        eyebrow="Kostenlos starten"
        title="Deine Stadt ist nicht dabei? Singles ab 50 gibt es überall."
        text="Leg dein Profil kostenlos an, wähle deinen Umkreis und schau in Ruhe, wer in deiner Region zu dir passen könnte."
        primary={{ label: "Kostenlos starten", href: siteConfig.links.registrationLocation }}
        secondary={{ label: "Zum Magazin", href: "/magazin/" }}
      />
    </section>
  );
}
