import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityCharacterArt } from "@/components/city-character-art";
import {
  ChCityAuthorBox,
  ChCityStats,
  ChFlirtFactorCard,
  ChFlirtFactorNote,
  ChPlaceCards,
  flirtFactorHeadline,
} from "@/components/ch-city-modules";
import { CityFurtherCities } from "@/components/city-further-cities";
import { CityImageDialog } from "@/components/city-image-dialog";
import { IconyIframeSinglesWidget } from "@/components/icony-iframe-singles-widget";
import { MarketHtml } from "@/components/market-html";
import { MarketLink } from "@/components/market-link";
import { getIconyWidgetLocationForRoute } from "@/data/city-widget-locations";
import { getChCityFacts } from "@/data/ch-city-facts";
import { cityArtAltText, cityArtImageSrc } from "@/lib/city-art";
import { getSwissCity, getSwissCitySlugs, swissPartnersuche } from "@/lib/ch-partnersuche";
import { citySearchUrl } from "@/lib/city-search";
import { pickFurtherCities } from "@/lib/further-cities";
import { jsonLd } from "@/lib/seo";
import { marketPartnersuchePath, publicMarketUrl, registrationUrl } from "@/lib/markets";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getSwissCitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getSwissCity(slug);
  if (!city) return {};
  const route = marketPartnersuchePath("ch", city.slug);
  return {
    title: { absolute: `${city.title} | ab50.ch` },
    description: city.description,
    alternates: { canonical: route.publicUrl },
    openGraph: {
      title: city.title,
      description: city.description,
      url: route.publicUrl,
      type: "article",
      locale: "de_CH",
      siteName: "ab50.ch",
      images: [{ url: city.heroImage.url, alt: city.heroImage.alt }],
    },
  };
}

export default async function SwissPartnersucheCityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = getSwissCity(slug);
  if (!city) notFound();

  const facts = getChCityFacts(city.slug);
  const route = marketPartnersuchePath("ch", city.slug);
  const overviewRoute = marketPartnersuchePath("ch");
  const furtherCities = pickFurtherCities(
    swissPartnersuche.cities.map((item) => {
      const itemRoute = marketPartnersuchePath("ch", item.slug);
      return {
        key: item.slug,
        name: item.name,
        path: itemRoute.publicPath,
        href: itemRoute.publicUrl,
        previewHref: itemRoute.previewPath,
        hasImage: true,
        image: {
          src: cityArtImageSrc(item.slug, "thumb"),
          alt: cityArtAltText(item.slug, item.name),
          width: 1000,
          height: 420,
          unoptimized: true,
        },
      };
    }),
    route.publicPath,
  );
  const registration = registrationUrl("ch", "location");
  const search = citySearchUrl("ch", city.slug);
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: city.title,
    headline: city.title,
    description: city.description,
    url: route.publicUrl,
    inLanguage: "de-CH",
    about: `Partnersuche ab 50 in ${city.name}`,
    image: city.heroImage.url,
    isPartOf: { "@type": "WebSite", name: "ab50.ch", url: publicMarketUrl("ch", "/") },
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Partnersuche Schweiz", item: overviewRoute.publicUrl },
      { "@type": "ListItem", position: 2, name: city.name, item: route.publicUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <article className="container article-page city-page city-page-premium market-city-page">
        <div className="category-hero-card city-overview-hero city-detail-hero city-premium-hero">
          <div className="category-hero-copy">
            <nav className="article-breadcrumbs" aria-label="Breadcrumb">
              <MarketLink href={overviewRoute.publicUrl} previewHref={overviewRoute.previewPath}>Partnersuche Schweiz</MarketLink>
              <span aria-hidden="true">/</span>
              <span>{city.name}</span>
            </nav>
            <p className="eyebrow">Partnersuche ab 50 · Schweiz</p>
            <h1>{city.title}</h1>
            <p className="lead">{city.description}</p>
            <div className="trust-chip-row" aria-label="Stadtvorteile">
              {(facts?.heroChips ?? [`Singles ab 50`, `${city.name} & Umgebung`, "Kostenlos starten"]).map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
            <div className="hero-actions">
              <a className="button-primary" href={registration}>Kostenlos starten</a>
              <MarketLink className="button-secondary" href={overviewRoute.publicUrl} previewHref={overviewRoute.previewPath}>Alle Schweizer Städte</MarketLink>
            </div>
          </div>
          <aside className="category-hero-sidecard city-hero-sidecard city-hero-visual-shell" aria-label={`${city.name} auf einen Blick`}>
            <div className="city-visual-wrap">
              <CityCharacterArt
                slug={city.slug}
                name={city.name}
                variant="hero"
                className="city-phone-image city-art-image"
              />
              {facts ? (
                <ChFlirtFactorCard cityName={city.name} score={facts.flirtFaktor} text={facts.flirtFaktorText} />
              ) : null}
            </div>
          </aside>
        </div>

        <IconyIframeSinglesWidget
          city={city.name}
          platformId="ab50ch"
          location={getIconyWidgetLocationForRoute(city.slug, 41)}
          searchUrl={search}
          profileClickUrl={registration}
          eyebrow="Singles in der Schweiz entdecken"
          title={`Neue Singles in ${city.name}`}
          text={`Schau dir aktuelle Profile aus ${city.name} und Umgebung an oder erweitere den Suchradius direkt auf ab50.ch.`}
          ctaLabel={`Ausführlicher in ${city.name} suchen`}
          note="Kostenlos starten · Schweizer Umkreis wählen · diskret stöbern"
        />

        {facts ? (
          <>
            <section className="overview-intent-grid city-intro-grid" aria-label="Schnelleinstieg">
              <article className="overview-intent-card overview-intent-card-guide city-intro-card">
                <span>Flirt-Faktor {city.name}</span>
                <strong>{flirtFactorHeadline(facts.flirtFaktor)}</strong>
                <p>{city.name}: {facts.flirtFaktor} Punkte. {facts.flirtFaktorText}</p>
              </article>
              <article className="overview-intent-card overview-intent-card-trust city-intro-card">
                <span>Darum lohnt sich die Seite</span>
                <strong>Wo du in {city.name} leichter ins Gespräch kommst</strong>
                <p>Du bekommst Date-Ideen, passende Treffpunkte und konkrete Tipps, damit du in {city.name} entspannter neue Menschen kennenlernst.</p>
              </article>
              <article className="overview-intent-card overview-intent-card-featured city-intro-card">
                <span>Nächster Schritt</span>
                <strong>Danach kannst du direkt kostenlos weitermachen</strong>
                <p>Wenn du nicht nur lesen, sondern wirklich neue Begegnungen in {city.name} entdecken möchtest, ist der Einstieg auf ab50.ch sofort greifbar.</p>
              </article>
            </section>

            <div className="city-top-modules">
              <ChCityStats cityName={city.name} facts={facts} />
              <section className="city-cta-box city-cta-box-compact" aria-label="Nächster Schritt">
                <p className="eyebrow">Bereit für den nächsten Schritt?</p>
                <h2>Starte kostenlos und entdecke Singles ab 50 in {city.name}.</h2>
                <p>Du kannst dich in Ruhe umsehen und selbst entscheiden, wie du den ersten Kontakt gestaltest.</p>
                <div className="city-cta-actions">
                  <a className="button-primary" href={registration}>Kostenlos starten</a>
                  <MarketLink className="button-secondary" href={overviewRoute.publicUrl} previewHref={overviewRoute.previewPath}>Alle Schweizer Städte</MarketLink>
                </div>
                <small>Kostenlos starten · Schweizer Umkreis wählen · diskret stöbern</small>
              </section>
            </div>
          </>
        ) : null}

        <section className="article-body-grid city-body-grid">
          <aside className="article-side-column city-side-column">
            <div className="city-sidebar-stack">
              <section className="city-sidebar-card city-sidebar-soft" aria-label="Kurz zusammengefasst">
                <p className="eyebrow">Dein regionaler Einstieg</p>
                <strong>{city.name} auf einen Blick</strong>
                <ul className="city-key-points">
                  {facts ? (
                    <>
                      <li><strong>Flirt-Faktor {facts.flirtFaktor}/100</strong> für {city.name}</li>
                      <li><strong>{facts.einwohner} Einwohner</strong> · {facts.dritteKachel.wert} {facts.dritteKachel.label}</li>
                      <li><strong>3 Date-Orte:</strong> {facts.treffpunkte.map((place) => place.name).join(", ")}</li>
                    </>
                  ) : (
                    <>
                      <li>Lokale Orte und Ideen für erste Treffen</li>
                      <li>Regionale Singles auf ab50.ch entdecken</li>
                    </>
                  )}
                  <li>Weitere Schweizer Städte direkt erreichbar</li>
                </ul>
              </section>
              <section className="city-sidebar-card city-sidebar-cta" aria-label="Kostenlos starten">
                <p className="eyebrow">Nächster Schritt</p>
                <strong>Schau kostenlos, wer in deiner Region zu dir passen könnte.</strong>
                <p>Du entscheidest selbst, wann und mit wem du Kontakt aufnehmen möchtest.</p>
                <a className="button-primary" href={registration}>Kostenlos starten</a>
              </section>
            </div>
          </aside>

          <div className="article-main-column">
            <section className="article-takeaway-box city-takeaway-box" aria-label="Stadtprofil">
              <p className="eyebrow">Stadtprofil Schweiz</p>
              <h2>Dating ab 50 in {city.name}</h2>
              <p>Diese Stadtseite bündelt lokale Anregungen, Treffpunkte und Wege, wie du in {city.name} entspannt neue Menschen kennenlernen kannst.</p>
            </section>
            <figure className="city-stat-figure" aria-label={`${city.name} in Zahlen`}>
              <figcaption className="city-stat-figure-head">
                <p className="eyebrow">{city.name} in Zahlen</p>
                <strong>Die Stadt-Statistik für Singles ab 50</strong>
                <p>Einwohner, Quartiere und beliebte Treffpunkte auf einen Blick – tippe auf die Grafik für die grosse Ansicht.</p>
              </figcaption>
              <CityImageDialog
                city={city.name}
                imageUrl={city.heroImage.url}
                imageAlt={`Statistik-Grafik: ${city.heroImage.alt}`}
                registrationUrl={registration}
                imageClassName="city-stat-image"
                hint="Grafik vergrössern"
              />
            </figure>

            {facts ? <ChPlaceCards cityName={city.name} places={facts.treffpunkte} /> : null}

            <div className="article-content-card">
              <MarketHtml market="ch" html={city.contentHtml} />
            </div>

            {facts ? <ChFlirtFactorNote cityName={city.name} score={facts.flirtFaktor} /> : null}

            <ChCityAuthorBox cityName={city.name} />
          </div>
        </section>

        <CityFurtherCities
          tiles={furtherCities}
          totalCities={swissPartnersuche.cities.length}
          overviewHref={overviewRoute.publicUrl}
          overviewPreviewHref={overviewRoute.previewPath}
        />

        <section className="overview-cta-strip category-final-cta" aria-label="Kostenlos starten">
          <div>
            <p className="eyebrow">Neue Kontakte in {city.name}</p>
            <h2>Starte kostenlos und entdecke Singles ab 50 aus deiner Region.</h2>
            <p>Du kannst dich in Ruhe umsehen und selbst entscheiden, wie du den ersten Kontakt gestaltest.</p>
          </div>
          <div className="overview-cta-actions">
            <a className="button-primary" href={registration}>Kostenlos starten</a>
            <MarketLink className="button-secondary" href={overviewRoute.publicUrl} previewHref={overviewRoute.previewPath}>Alle Städte</MarketLink>
          </div>
        </section>
      </article>
    </>
  );
}
