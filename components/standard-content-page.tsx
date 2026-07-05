import { absoluteUrl, jsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import type { StandardPage } from "@/data/standard-pages";

function externalAttrs(external?: boolean) {
  return external ? { target: "_blank", rel: "noopener noreferrer" } : undefined;
}

function StandardHero({ page }: { page: StandardPage }) {
  return (
    <header className="standard-hero ab50-standard-hero">
      <div className="container standard-hero-grid">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="lead">{page.lead}</p>
          <div className="trust-chip-row" aria-label="Vorteile">
            {page.highlights.map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="hero-actions">
            <a className="button-primary" href={page.primaryCtaHref}>{page.primaryCtaLabel}</a>
            {page.secondaryCtaHref && page.secondaryCtaLabel ? (
              <a className="button-secondary" href={page.secondaryCtaHref}>{page.secondaryCtaLabel}</a>
            ) : null}
          </div>
        </div>
        <aside className="standard-hero-card ab50-standard-hero-card" aria-label={`${siteConfig.name} Hinweis`}>
          <strong>{siteConfig.name}</strong>
          <span>für Singles mit Lebenserfahrung</span>
          <span>ruhig & verständlich</span>
          <span>mit echten Einblicken</span>
        </aside>
      </div>
    </header>
  );
}

function CardsSection({ page }: { page: StandardPage }) {
  if (!page.cards?.length) return null;
  return (
    <section className="container section-block">
      <div className="section-heading">
        <p className="eyebrow">Gut zu wissen</p>
        <h2>Was diese Seite abdeckt</h2>
      </div>
      <div className="card-grid standard-card-grid">
        {page.cards.map((card) => {
          const content = (
            <>
              <strong>{card.title}</strong>
              <span>{card.text}</span>
              {card.label ? <em>{card.label}</em> : null}
            </>
          );

          return card.href ? (
            <a className="card standard-card" href={card.href} key={card.title} {...externalAttrs(card.href.startsWith("http"))}>{content}</a>
          ) : (
            <article className="card standard-card" key={card.title}>{content}</article>
          );
        })}
      </div>
    </section>
  );
}

function SocialSection({ page }: { page: StandardPage }) {
  if (!page.socialLinks?.length) return null;
  return (
    <section className="container section-block">
      <div className="section-heading">
        <p className="eyebrow">Kanäle & Community</p>
        <h2>Social-Media-Übersicht</h2>
        <p>Hier findest du die wichtigsten Einstiege, wenn du ab50.de auch außerhalb der Plattform begleiten möchtest.</p>
      </div>
      <div className="card-grid standard-card-grid">
        {page.socialLinks.map((link) => (
          <a className="card standard-card" href={link.href} key={link.href} {...externalAttrs(link.external)}>
            <strong>{link.label}</strong>
            <span>{link.text}</span>
            <em>Kanal öffnen</em>
          </a>
        ))}
      </div>
    </section>
  );
}

function TemplateSpecificSection({ page }: { page: StandardPage }) {
  if (page.template === "trust") {
    return (
      <section className="container section-block two-column standard-split-section">
        <div className="stats-panel standard-info-panel">
          <p className="eyebrow">Transparenz</p>
          <h2>Bewertungen regelmäßig direkt an der Quelle prüfen</h2>
          <p>Externe Bewertungen können sich verändern. Deshalb bündeln wir die wichtigsten Einstiege, statt veraltete Momentaufnahmen dauerhaft festzuschreiben.</p>
        </div>
        <div className="city-cta-box city-cta-box-compact">
          <p className="eyebrow">Selbst testen</p>
          <h2>Am Ende zählt dein eigener Eindruck</h2>
          <p>Starte kostenlos, schau dir Profile und Funktionen in Ruhe an und entscheide selbst, ob ab50.de zu deiner Art von Partnersuche passt.</p>
          <div className="city-cta-actions">
            <a className="button-primary" href={siteConfig.links.registrationCommon}>Jetzt kostenlos registrieren</a>
            <a className="button-secondary" href={siteConfig.links.searchLocation}>Singles entdecken</a>
          </div>
        </div>
      </section>
    );
  }

  return <SocialSection page={page} />;
}

export function StandardContentPage({ page }: { page: StandardPage }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.seo.title,
    headline: page.title,
    description: page.seo.description,
    url: absoluteUrl(page.href),
    inLanguage: "de-DE",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };

  return (
    <article className={`standard-page standard-page-${page.template}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <StandardHero page={page} />
      {page.cards?.length ? <CardsSection page={page} /> : null}
      <TemplateSpecificSection page={page} />
      <section className="container section-block standard-final-cta">
        <div className="city-cta-box">
          <p className="eyebrow">Kostenlos starten</p>
          <h2>Bereit, neue Singles kennenzulernen?</h2>
          <p>Schau dich in Ruhe um, entdecke passende Kontakte und entscheide selbst, wen du näher kennenlernen möchtest.</p>
          <div className="city-cta-actions">
            <a className="button-primary" href={siteConfig.links.registrationCommon}>Jetzt kostenlos registrieren</a>
            <a className="button-secondary" href="/partnersuche">Partnersuche nach Städten</a>
          </div>
        </div>
      </section>
    </article>
  );
}
