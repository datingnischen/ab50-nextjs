import Image from "next/image";
import type { Metadata } from "next";
import { MarketHtml } from "@/components/market-html";
import { MarketLink } from "@/components/market-link";
import { swissPartnersuche } from "@/lib/ch-partnersuche";
import { marketPartnersuchePath, publicMarketUrl, registrationUrl } from "@/lib/markets";

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
  return (
    <section className="container section-block city-overview-page market-city-overview-page">
      <div className="category-hero-card city-overview-hero">
        <div className="category-hero-copy">
          <p className="eyebrow">Partnersuche ab 50 · Schweiz</p>
          <h1>{swissPartnersuche.overview.title}</h1>
          <p className="lead">Finde regionale Stadtseiten, Dating-Tipps und passende Einstiege für neue Begegnungen ab 50 in der Schweiz.</p>
          <div className="trust-chip-row" aria-label="Vorteile der Schweizer Stadtseiten">
            <span>18 Schweizer Städte</span>
            <span>Regionale Orientierung</span>
            <span>Kostenlos starten</span>
          </div>
          <div className="hero-actions">
            <a className="button-primary" href={registrationUrl("ch", "location")}>Kostenlos starten</a>
            <a className="button-secondary" href="https://ab50.ch/dating-tipps/">Dating-Tipps</a>
          </div>
        </div>
        <aside className="category-hero-sidecard city-hero-sidecard city-hero-visual-shell" aria-label="Partnersuche in der Schweiz">
          <Image
            priority
            src={swissPartnersuche.overview.heroImage.url}
            alt={swissPartnersuche.overview.heroImage.alt}
            width={1000}
            height={667}
            className="city-phone-image"
            sizes="(max-width: 980px) 100vw, 420px"
          />
        </aside>
      </div>

      <div className="section-heading wide-heading">
        <p className="eyebrow">Städte im Überblick</p>
        <h2>Singles ab 50 in deiner Schweizer Stadt finden</h2>
        <p>Wähle deine Stadt und entdecke lokale Treffpunkte, Ideen für erste Dates und den direkten Einstieg in die Partnersuche.</p>
      </div>

      <div className="post-grid">
        {swissPartnersuche.cities.map((city) => {
          const route = marketPartnersuchePath("ch", city.slug);
          return (
            <MarketLink className="post-card" href={route.publicUrl} previewHref={route.previewPath} key={city.slug}>
              <Image
                src={city.heroImage.url}
                alt={city.heroImage.alt}
                width={1000}
                height={667}
                className="post-card-image"
                sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"
              />
              <div className="post-card-body">
                <span>Regionale Partnersuche · Schweiz</span>
                <strong>Singles ab 50 in {city.name}</strong>
                <p>{city.description}</p>
                <em className="card-read-more">Stadtseite ansehen</em>
              </div>
            </MarketLink>
          );
        })}
      </div>

      <section className="article-body-grid city-body-grid market-overview-editorial" aria-label="Partnersuche ab 50 in der Schweiz">
        <div className="article-main-column">
          <div className="article-content-card">
            <MarketHtml market="ch" html={swissPartnersuche.overview.contentHtml} />
          </div>
          <section className="city-source-box" aria-label="Quelle und Bildherkunft">
            <p className="eyebrow">Quelle & Bildherkunft</p>
            <p>Die Schweizer Übersicht wurde aus dem bestehenden öffentlichen ab50.ch-Auftritt übernommen und für die neue Marktstruktur aufbereitet.</p>
            <a href={swissPartnersuche.overview.sourceUrl} rel="nofollow noopener noreferrer" target="_blank">Öffentliche Originalseite auf ab50.ch</a>
          </section>
        </div>
      </section>

      <section className="overview-cta-strip category-final-cta" aria-label="Kostenlos starten">
        <div>
          <p className="eyebrow">Bereit für neue Begegnungen?</p>
          <h2>Starte kostenlos auf ab50.ch.</h2>
          <p>Entdecke Singles ab 50 aus deiner Region und entscheide selbst, in welchem Tempo du neue Kontakte knüpfst.</p>
        </div>
        <a className="button-primary" href={registrationUrl("ch", "location")}>Kostenlos starten</a>
      </section>
    </section>
  );
}
