import type { Metadata } from "next";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import { ABOUT_HISTORY_PATH, ABOUT_REVIEWS_PATH, ABOUT_SOCIAL_PATH, ABOUT_ROOT_PATH } from "@/lib/about-pages";

export const metadata: Metadata = {
  title: "Über ab50.de",
  description: "Hintergründe, Social Media und Bewertungen rund um ab50.de auf einen Blick.",
  alternates: { canonical: ABOUT_ROOT_PATH },
  openGraph: {
    title: "Über ab50.de",
    description: "Hintergründe, Social Media und Bewertungen rund um ab50.de auf einen Blick.",
    url: absoluteUrl(ABOUT_ROOT_PATH),
    type: "website",
    locale: "de_DE",
  },
};

const aboutCards = [
  {
    eyebrow: "Unsere Geschichte",
    title: "So hat sich ab50.de entwickelt",
    text: "Gegründet 2011. Von den frühen Anfängen bis zur heutigen Plattform mit Millionen von Nutzern: Web-Snapshots zeigen die Entwicklung.",
    href: ABOUT_HISTORY_PATH,
    label: "Zur Geschichte",
  },
  {
    eyebrow: "Social Media",
    title: "Facebook, Community und YouTube",
    text: "Videos zu Dating, Tipps, Erfolgsgeschichten und Diskussionen — direkt auf Facebook, YouTube und in der Community.",
    href: ABOUT_SOCIAL_PATH,
    label: "Zur Social-Media-Seite",
  },
  {
    eyebrow: "Bewertungen & Erfahrungen",
    title: "Was Singles über ab50.de sagen",
    text: "Trustpilot-Bewertungen, Feedback, Vergleiche und Erfahrungsberichte — von echten Nutzern.",
    href: ABOUT_REVIEWS_PATH,
    label: "Zu Bewertungen & Erfahrungen",
  },
  {
    eyebrow: "50plus Magazin",
    title: "Tipps zu Dating, Sicherheit und Profil",
    text: "Wie du ein starkes Profil schreibst, Fakes erkennst, sicher bleibst und neue Menschen kennenlernst.",
    href: "/magazin",
    label: "Zum Magazin",
  },
];

const aboutIntroCards = [
  {
    eyebrow: "Hinter den Kulissen",
    title: "Wer ist ab50.de?",
    text: "Gegründet 2011. Wie ab50.de gewachsen ist, was andere Singles sagen, und wo du die Community findest.",
    variant: "guide",
  },
  {
    eyebrow: "Echte Bewertungen",
    title: "Das sagen Nutzer über ab50.de",
    text: "Trustpilot, externe Vergleiche und echte Nutzerfeedback. Keine gekauften Bewertungen — nur echte Erfahrungen.",
    variant: "trust",
  },
  {
    eyebrow: "Nächster Schritt",
    title: "Jetzt direkt durchstarten",
    text: "Geschichte lesen, Bewertungen checken, Social Media folgen oder gleich kostenlos registrieren — alles auf dieser Seite.",
    variant: "featured",
  },
] as const;

const aboutQuickLinks = [
  { href: ABOUT_HISTORY_PATH, label: "Unsere Geschichte lesen" },
  { href: ABOUT_SOCIAL_PATH, label: "Social Media entdecken" },
  { href: ABOUT_REVIEWS_PATH, label: "Bewertungen & Erfahrungen ansehen" },
  { href: "/magazin", label: "Zum 50plus Magazin" },
];

export default function UeberUnsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Über ab50.de",
    headline: "Über ab50.de",
    description: "Hintergründe, Social Media und Bewertungen rund um ab50.de auf einen Blick.",
    url: absoluteUrl(ABOUT_ROOT_PATH),
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
      <article className="standard-page standard-page-about">
        <header className="standard-hero ab50-standard-hero">
          <div className="container standard-hero-grid">
            <div>
              <p className="eyebrow">Hinter den Kulissen</p>
              <h1>Über ab50.de</h1>
              <p className="lead">ab50.de für Singles mit Lebenserfahrung: kostenlos Kontakte finden, Nachrichten schreiben, neue Menschen kennenlernen.</p>
              <div className="trust-chip-row" aria-label="Wichtige Infos zu ab50.de">
                <span>Unsere Geschichte</span>
                <span>Social Media & Community</span>
                <span>Bewertungen & Erfahrungen</span>
                <span>Dating Tipps & Sicherheit</span>
              </div>
              <div className="hero-actions">
                <a className="button-primary" href={ABOUT_HISTORY_PATH}>Unsere Geschichte ansehen</a>
                <a className="button-secondary" href={ABOUT_SOCIAL_PATH}>Social Media entdecken</a>
              </div>
            </div>
            <aside className="standard-hero-card ab50-standard-hero-card" aria-label="Was ab50.de ausmacht">
              <strong>{siteConfig.name}</strong>
              <span>Kostenlos Profile anlegen, durchstöbern und Nachrichten schreiben</span>
              <span>Verifizierte Profile und sichere Nachrichtenbox</span>
              <span>Erfolgsgeschichten und Tipps von echten Nutzern</span>
            </aside>
          </div>
        </header>

        <section className="container section-block overview-intent-grid" aria-label="Schnelleinstieg Über ab50.de">
          {aboutIntroCards.map((card) => (
            <article className={`overview-intent-card overview-intent-card-${card.variant}`} key={card.title}>
              <span>{card.eyebrow}</span>
              <strong>{card.title}</strong>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className="container article-body-grid about-page-grid">
          <aside className="article-side-column about-page-sidebar">
            <div className="city-sidebar-stack">
              <section className="city-sidebar-card magazine-about-sidebar" aria-label="Schnelllinks">
                <p className="eyebrow">Schnell zum Punkt</p>
                <strong>Was willst du über ab50.de wissen?</strong>
                <p>Hier sind die wichtigsten Links: Wie wir entstanden sind, was echte Singles sagen, wo du uns online findest.</p>
                <ul className="city-key-points about-quick-links">
                  {aboutQuickLinks.map((link) => (
                    <li key={link.href}><a href={link.href}>{link.label}</a></li>
                  ))}
                </ul>
                <div className="article-final-actions">
                  <a className="button-primary" href={ABOUT_HISTORY_PATH}>Unsere Geschichte lesen</a>
                  <a className="button-secondary" href={siteConfig.links.registrationCommon}>Jetzt kostenlos starten</a>
                </div>
              </section>
            </div>
          </aside>

          <div className="article-main-column">
            <section className="section-block about-main-intro-card">
              <div className="section-heading">
                <p className="eyebrow">Vier wichtige Seiten</p>
                <h2>Was willst du über ab50.de erfahren?</h2>
                <p>Geschichte, Bewertungen, Social Media und Tipps — alles, um ab50.de besser kennenzulernen.</p>
              </div>
              <div className="card-grid standard-card-grid">
                {aboutCards.map((card) => (
                  <a className="card standard-card" href={card.href} key={card.href}>
                    <span className="standard-card-kicker">{card.eyebrow}</span>
                    <strong>{card.title}</strong>
                    <span>{card.text}</span>
                    <em>{card.label}</em>
                  </a>
                ))}
              </div>
            </section>

            <section className="two-column standard-split-section about-bottom-split">
              <div className="stats-panel standard-info-panel">
                <p className="eyebrow">Warum diese Seite wichtig ist</p>
                <h2>Lerne ab50.de kennen, bevor du startest</h2>
                <p>Was ist ab50.de? Wie ist es entstanden? Was sagen andere Nutzer? Schau dir die Geschichte, Bewertungen und Tipps an — dann weißt du, ob es zu dir passt.</p>
              </div>
              <div className="city-cta-box city-cta-box-compact">
                <p className="eyebrow">Direkter Einstieg</p>
                <h2>Wenn du nicht nur lesen, sondern direkt loslegen möchtest</h2>
                <p>Du kannst jederzeit kostenlos starten, Profile ansehen und selbst entscheiden, ob ab50.de zu deinem Tempo und deiner Art der Partnersuche passt.</p>
                <div className="city-cta-actions">
                  <a className="button-primary" href={siteConfig.links.registrationCommon}>Jetzt kostenlos registrieren</a>
                  <a className="button-secondary" href="/partnersuche">Stadtseiten ansehen</a>
                </div>
              </div>
            </section>
          </div>
        </section>
      </article>
    </>
  );
}
