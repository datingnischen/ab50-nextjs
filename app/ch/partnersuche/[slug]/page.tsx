import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityImageDialog } from "@/components/city-image-dialog";
import { IconyIframeSinglesWidget } from "@/components/icony-iframe-singles-widget";
import { MarketHtml } from "@/components/market-html";
import { MarketLink } from "@/components/market-link";
import { getIconyWidgetLocation } from "@/data/city-widget-locations";
import { getSwissCity, getSwissCitySlugs, swissPartnersuche } from "@/lib/ch-partnersuche";
import { jsonLd } from "@/lib/seo";
import { marketPartnersuchePath, publicMarketUrl, registrationUrl, searchUrl } from "@/lib/markets";

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

  const route = marketPartnersuchePath("ch", city.slug);
  const overviewRoute = marketPartnersuchePath("ch");
  const related = swissPartnersuche.cities.filter((item) => item.slug !== city.slug).slice(0, 6);
  const registration = registrationUrl("ch", "location");
  const search = searchUrl("ch");
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
              <span>Singles ab 50</span>
              <span>{city.name} & Umgebung</span>
              <span>Kostenlos starten</span>
            </div>
            <div className="hero-actions">
              <a className="button-primary" href={registration}>Kostenlos starten</a>
              <MarketLink className="button-secondary" href={overviewRoute.publicUrl} previewHref={overviewRoute.previewPath}>Alle Schweizer Städte</MarketLink>
            </div>
          </div>
          <aside className="category-hero-sidecard city-hero-sidecard city-hero-visual-shell" aria-label={`${city.name} auf einen Blick`}>
            <CityImageDialog
              city={city.name}
              imageUrl={city.heroImage.url}
              imageAlt={city.heroImage.alt}
              registrationUrl={registration}
            />
          </aside>
        </div>

        <IconyIframeSinglesWidget
          city={city.name}
          platformId="ab50ch"
          location={getIconyWidgetLocation(city.name, 41)}
          searchUrl={search}
          profileClickUrl={registration}
          eyebrow="Singles in der Schweiz entdecken"
          title={`Neue Singles in ${city.name}`}
          text={`Schau dir aktuelle Profile aus ${city.name} und Umgebung an oder erweitere den Suchradius direkt auf ab50.ch.`}
          ctaLabel={`Ausführlicher in ${city.name} suchen`}
          note="Kostenlos starten · Schweizer Umkreis wählen · diskret stöbern"
        />

        <section className="article-body-grid city-body-grid">
          <aside className="article-side-column city-side-column">
            <div className="city-sidebar-stack">
              <section className="city-sidebar-card city-sidebar-soft" aria-label="Kurz zusammengefasst">
                <p className="eyebrow">Dein regionaler Einstieg</p>
                <strong>Partnersuche ab 50 in {city.name}</strong>
                <ul className="city-key-points">
                  <li>Lokale Orte und Ideen für erste Treffen</li>
                  <li>Regionale Singles auf ab50.ch entdecken</li>
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
            <div className="article-content-card">
              <MarketHtml market="ch" html={city.contentHtml} />
            </div>
          </div>
        </section>

        <div className="category-topic-strip city-related-strip" aria-label="Weitere Schweizer Städte">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Weitere Städte</p>
            <h2>Weitere regionale Einstiege in der Schweiz</h2>
          </div>
          <div className="category-topic-grid">
            {related.map((item) => {
              const relatedRoute = marketPartnersuchePath("ch", item.slug);
              return (
                <MarketLink className="category-topic-card" href={relatedRoute.publicUrl} previewHref={relatedRoute.previewPath} key={item.slug}>
                  <span>{item.name}</span>
                  <strong>Singles ab 50 in {item.name} kennenlernen</strong>
                  <em className="card-read-more">Stadtseite öffnen</em>
                </MarketLink>
              );
            })}
          </div>
        </div>

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
