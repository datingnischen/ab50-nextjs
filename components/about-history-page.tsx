import Image from "next/image";
import type { StaticImageData } from "next/image";
import shot2001 from "../public/history/ab50-20010217133117.png";
import shot2013 from "../public/history/ab50-2013-wayback-raw.png";
import shot2024 from "../public/history/ab50-20240414141455.png";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import { ABOUT_HISTORY_PATH } from "@/lib/about-pages";
import { ab50HistorySnapshots } from "@/data/about-history";

const snapshotImages: Record<string, StaticImageData> = {
  "2001": shot2001,
  "2013": shot2013,
  "2024": shot2024,
};

export function AboutHistoryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Unsere Geschichte",
    headline: "Unsere Geschichte",
    description: "Wie sich ab50.de im Laufe der Jahre verändert hat – mit ausgewählten Wayback-Snapshots der Plattform.",
    url: absoluteUrl(ABOUT_HISTORY_PATH),
    inLanguage: "de-DE",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <article className="standard-page standard-page-history">
        <header className="standard-hero ab50-standard-hero history-story-hero">
          <div className="container">
            <p className="eyebrow">Unsere Reise</p>
            <h1>Unsere Geschichte</h1>
            <p className="lead">Anhand ausgewählter Wayback-Snapshots wird sichtbar, wie sich ab50.de über die Jahre verändert hat – von sehr frühen Web-Spuren bis zu einer klaren 50plus-Plattform mit Magazin, Vertrauen und modernen Einstiegen.</p>
            <div className="trust-chip-row" aria-label="Geschichtliche Einordnung">
              <span>frühe Web-Spuren</span>
              <span>Zwischenphasen sichtbar</span>
              <span>Transformation zur 50plus-Plattform</span>
              <span>Snapshots aus dem Webarchiv</span>
            </div>
            <div className="hero-actions">
              <a className="button-primary" href="#jahr-2001">Zur Timeline</a>
              <a className="button-secondary" href="/ueber-uns">Zur Über-uns-Seite</a>
            </div>
          </div>
        </header>

        <section className="container section-block history-story-nav-wrap">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Zeitsprünge</p>
            <h2>Direkt in eine Phase springen</h2>
          </div>
          <div className="history-story-nav" aria-label="Jahresnavigation">
            {ab50HistorySnapshots.map((item) => (
              <a key={item.year} href={`#jahr-${item.year}`} className="history-year-pill">{item.year}</a>
            ))}
          </div>
        </section>

        <section className="container section-block history-story-grid">
          {ab50HistorySnapshots.map((item) => (
            <article key={item.year} id={`jahr-${item.year}`} className="history-story-card">
              <div className="history-story-card-copy">
                <p className="eyebrow">{item.year}</p>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <div className="article-final-actions">
                  <a className="button-secondary" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.sourceLabel}</a>
                </div>
              </div>
              <div className="history-story-image-wrap">
                <Image
                  src={snapshotImages[item.year]}
                  alt={item.imageAlt}
                  className="history-story-image"
                  sizes="(max-width: 980px) 100vw, 54vw"
                  unoptimized
                />
              </div>
            </article>
          ))}
        </section>

        <section className="container section-block standard-final-cta">
          <div className="city-cta-box">
            <p className="eyebrow">Heute</p>
            <h2>Die Entwicklung geht weiter</h2>
            <p>Aus frühen, teils sehr schlichten Web-Spuren ist über viele Stationen eine Plattform entstanden, die Singles ab 50 Orientierung, Magazin-Inhalte und direkte Einstiege in die Partnersuche bietet.</p>
            <div className="city-cta-actions">
              <a className="button-primary" href={siteConfig.links.registrationCommon}>Jetzt kostenlos registrieren</a>
              <a className="button-secondary" href="/partnersuche">Partnersuche nach Städten</a>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
