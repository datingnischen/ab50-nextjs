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
    title: "Die Entwicklung von ab50.de über die Jahre sehen",
    text: "Auf der Geschichtsseite zeigen ausgewählte Wayback-Snapshots, wie sich der Auftritt von ab50.de von frühen Web-Spuren bis zur heutigen Plattform verändert hat.",
    href: ABOUT_HISTORY_PATH,
    label: "Zur Geschichte",
  },
  {
    eyebrow: "Social Media",
    title: "Tipps, Community und Updates direkt öffnen",
    text: "Auf Social Media begleitet dich ab50.de mit Facebook, Community-Austausch und YouTube-Inhalten rund um Dating, Kontakte und Partnersuche ab 50.",
    href: ABOUT_SOCIAL_PATH,
    label: "Zur Social-Media-Seite",
  },
  {
    eyebrow: "Bewertungen & Erfahrungen",
    title: "So bewerten echte Singles ab50.de",
    text: "Nutzerfeedback, Trustpilot-Bewertungen und Erfahrungsberichte von Menschen wie dir — damit du weißt, was andere denken.",
    href: ABOUT_REVIEWS_PATH,
    label: "Zu Bewertungen & Erfahrungen",
  },
  {
    eyebrow: "50plus Magazin",
    title: "Echte Tipps zu Dating, Sicherheit und Kontakten",
    text: "Neben der Partnersuche: Wie du ein gutes Profil schreibst, echte Menschen erkennst, sicher bleibst und neue Nähe aufbaust.",
    href: "/magazin",
    label: "Zum Magazin",
  },
];

const aboutIntroCards = [
  {
    eyebrow: "Wer steckt dahinter?",
    title: "Hinter den Kulissen: ab50.de & dein Vertrauen",
    text: "Unsere Geschichte, wie andere uns bewerten, und wo du die Community findest — damit du weißt, wer du bist.",
    variant: "guide",
  },
  {
    eyebrow: "Authentische Bewertungen",
    title: "Was echte Singles über ab50.de denken",
    text: "Kein Hype, nur echte Erfahrungen von Menschen wie dir. Trustpilot, Community-Feedback und externe Vergleiche in voller Transparenz.",
    variant: "trust",
  },
  {
    eyebrow: "Direkt weitermachen",
    title: "Von hier aus zum nächsten Schritt",
    text: "Geschichte lesen, Social Media checken, Bewertungen ansehen oder direkt kostenlos starten — alles auf dieser Seite verlinkt.",
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
              <p className="lead">ab50.de begleitet Singles mit Lebenserfahrung auf dem Weg zu neuen Kontakten, guten Gesprächen und einem ruhigen, verständlichen Einstieg in die Partnersuche.</p>
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
              <span>für Singles ab 50, die echte Nähe suchen</span>
              <span>Authentische Profile & Sicherheit an erster Stelle</span>
              <span>Community, Tipps und echte Erfolgsstorys</span>
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
                <p>Unsere Geschichte, echte Bewertungen, wo du uns online findest und wie du sicher startest — alles direkt verlinkt.</p>
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
                <h2>Diese Informationen helfen dir, Vertrauen zu fassen</h2>
                <p>Du willst die Plattform verstehen, sehen wie andere Singles sie bewerten und wissen, ob sie zu dir passt — das ist völlig normal. Hier findest du alle Antworten.</p>
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
