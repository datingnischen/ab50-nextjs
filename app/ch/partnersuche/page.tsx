import type { Metadata } from "next";
import { MarketHtml } from "@/components/market-html";
import { MarketLink } from "@/components/market-link";
import { cityArtAltText, cityArtImageSrc } from "@/lib/city-art";
import { swissPartnersuche } from "@/lib/ch-partnersuche";
import { marketPartnersuchePath, registrationUrl } from "@/lib/markets";
import { cityCardCopy } from "@/lib/city-card-copy";
import { buildMap, cityGeo } from "@/lib/city-geo";
import { getChCityFacts } from "@/data/ch-city-facts";
import { CitySearchFallback } from "@/components/city-search-fallback";
import { CityFilter } from "@/components/ab-city/city-filter";
import { CountryMap } from "@/components/ab-city/country-map";
import { CtaBand } from "@/components/ab-city/city-parts";
import { HeartIcon, PinIcon } from "@/components/ab-icons";
import "@/components/ab-city/ab-overview.css";

const overviewPath = marketPartnersuchePath("ch");

export const metadata: Metadata = {
  title: { absolute: "Partnersuche ab 50 in der Schweiz | ab50.ch" },
  description: swissPartnersuche.overview.description,
  alternates: { canonical: overviewPath.publicUrl },
  openGraph: {
    title: "Partnersuche ab 50 in der Schweiz",
    description: swissPartnersuche.overview.description,
    url: overviewPath.publicUrl,
    type: "website",
    locale: "de_CH",
    siteName: "ab50.ch",
    images: [{ url: swissPartnersuche.overview.heroImage.url, alt: swissPartnersuche.overview.heroImage.alt }],
  },
};

export default function SwissPartnersucheOverviewPage() {
  const cities = swissPartnersuche.cities;
  const regions = [...new Set(cities.map((city) => cityGeo("ch", city.slug)?.region).filter((region): region is string => Boolean(region)))].sort((a, b) => a.localeCompare(b, "de"));
  const map = buildMap("ch", cities.map((city) => {
    const route = marketPartnersuchePath("ch", city.slug);
    return { key: city.slug, slug: city.slug, name: city.name, href: route.publicUrl, previewHref: route.previewPath };
  }));
  const registration = registrationUrl("ch", "location");

  return (
    <section className="abm city-overview-page market-city-overview-page">
      <div className="ab-hero abm-hero">
        <div className="ab-wrap abm-hero-grid abm-hero-grid-ch">
          <div>
            <span className="ab-badge"><HeartIcon />Partnersuche ab 50 · Schweiz</span>
            <h1>{swissPartnersuche.overview.title}</h1>
            <p className="ab-lead">Finde regionale Stadtseiten, Dating-Tipps und passende Einstiege für neue Begegnungen ab 50 in der Schweiz.</p>
            <div className="trust-chip-row ab-chips" aria-label="Vorteile der Schweizer Stadtseiten">
              <span>{cities.length} Schweizer Städte</span>
              <span>Regionale Orientierung</span>
              <span>Seriös kennenlernen</span>
            </div>
            <div className="ab-actions">
              <a className="ab-btn ab-btn-primary" href={registration}>Kostenlos starten</a>
              <a className="ab-btn ab-btn-ghost" href="https://ab50.ch/dating-tipps/">Dating-Tipps</a>
            </div>
          </div>
          <CountryMap id="ch" label="Karte: Stadtseiten für Singles ab 50 in der Schweiz" map={map} />
        </div>
      </div>

      <div id="staedte" className="ab-wrap abm-panel-wrap">
        <div className="abm-panel">
          <div className="ab-head">
            <p className="ab-eyebrow"><PinIcon />Städte im Überblick</p>
            <h2>Singles ab 50 in deiner Schweizer Stadt finden</h2>
            <p>Wähle deine Stadt und entdecke lokale Treffpunkte, Ideen für erste Dates und den direkten Einstieg in die Partnersuche.</p>
          </div>
          <CityFilter regions={regions} regionLabel="Kanton" total={cities.length}>
            <div className="post-grid abm-grid">
              {cities.map((city, index) => {
                const route = marketPartnersuchePath("ch", city.slug);
                const facts = getChCityFacts(city.slug);
                const region = cityGeo("ch", city.slug)?.region || "";
                return (
                  <div key={city.slug} data-city={city.name} data-region={region} className="abm-card-cell">
                    <MarketLink className="post-card city-overview-card" href={route.publicUrl} previewHref={route.previewPath}>
                      <span className="abm-card-media">
                        {/* eslint-disable-next-line @next/next/no-img-element -- fertiges SVG, keine Optimierung noetig */}
                        <img
                          src={cityArtImageSrc(city.slug, "card")}
                          alt={cityArtAltText(city.slug, city.name)}
                          width={1000}
                          height={625}
                          loading={index < 3 ? "eager" : "lazy"}
                          decoding="async"
                          className="post-card-image city-art-image"
                        />
                        {region ? <span className="abm-card-region"><PinIcon />Kanton {region}</span> : null}
                        {facts ? <span className="abm-card-score" title="Flirt-Faktor">{facts.flirtFaktor}</span> : null}
                      </span>
                      <div className="post-card-body">
                        <span>Regionale Partnersuche · Schweiz</span>
                        <strong>Singles ab 50 in {city.name}</strong>
                        <p>{cityCardCopy("ch", city.slug)}</p>
                        <em className="card-read-more city-card-button">Stadtseite ansehen</em>
                      </div>
                    </MarketLink>
                  </div>
                );
              })}
            </div>
          </CityFilter>
          <div className="abm-fallback">
            <CitySearchFallback market="ch" />
          </div>
        </div>
      </div>

      <section className="ab-wrap ab-section" aria-label="Partnersuche ab 50 in der Schweiz">
        <div className="abm-story ab-rich">
          <MarketHtml market="ch" html={swissPartnersuche.overview.contentHtml} />
        </div>
      </section>

      <CtaBand
        eyebrow="Bereit für neue Begegnungen?"
        title="Starte kostenlos auf ab50.ch."
        text="Entdecke Singles ab 50 aus deiner Region und entscheide selbst, in welchem Tempo du neue Kontakte knüpfst."
        primary={{ label: "Kostenlos starten", href: registration }}
        secondary={{ label: "Dating-Tipps", href: "https://ab50.ch/dating-tipps/" }}
      />
    </section>
  );
}
