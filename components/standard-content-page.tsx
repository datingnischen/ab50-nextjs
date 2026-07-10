import { absoluteUrl, jsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import type { StandardPage } from "@/data/standard-pages";

function externalAttrs(external?: boolean) {
  return external ? { target: "_blank", rel: "noopener noreferrer" } : undefined;
}

function SocialIcon({ platform }: { platform: "facebook" | "youtube" }) {
  if (platform === "youtube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M21.3 7.2a2.95 2.95 0 0 0-2.08-2.09C17.36 4.6 12 4.6 12 4.6s-5.36 0-7.22.51A2.95 2.95 0 0 0 2.7 7.2 31 31 0 0 0 2.2 12c0 1.62.16 3.22.5 4.8a2.95 2.95 0 0 0 2.08 2.09c1.86.51 7.22.51 7.22.51s5.36 0 7.22-.51a2.95 2.95 0 0 0 2.08-2.09c.34-1.58.5-3.18.5-4.8 0-1.62-.16-3.22-.5-4.8Z"
          fill="currentColor"
        />
        <path d="m10.2 15.3 5.2-3.3-5.2-3.3v6.6Z" fill="#fff" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M15.12 5.32h-2.08c-2.3 0-3.79 1.52-3.79 3.87v2.13H6.8v2.96h2.45V21h3.01v-6.72h2.42l.36-2.96h-2.78V9.51c0-.86.23-1.45 1.44-1.45h1.53V5.39c-.26-.04-1.16-.07-2.13-.07Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SocialArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M7 17 17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getSocialActionLabel(link: NonNullable<StandardPage["socialLinks"]>[number]) {
  if (link.ctaLabel) return link.ctaLabel;
  if (link.platform === "youtube") return "Videos ansehen";
  return link.kind.toLowerCase().includes("gruppe") ? "Gruppe öffnen" : "Seite ansehen";
}

function StandardHero({ page }: { page: StandardPage }) {
  return (
    <header className="standard-hero ab50-standard-hero">
      <div className="container standard-hero-grid">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="lead">{page.lead}</p>
          {page.heroImageSrc ? (
            <figure className="standard-hero-figure">
              <img src={page.heroImageSrc} alt={page.heroImageAlt ?? page.title} loading="lazy" />
            </figure>
          ) : null}
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
          <span>für Menschen, die es ernst meinen</span>
          <span>mit echten Bewertungen</span>
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
        <p className="eyebrow">Das solltest du wissen</p>
        <h2>Echte Erfahrungen & externe Bewertungen</h2>
      </div>
      <div className="card-grid standard-card-grid">
        {page.cards.map((card) => {
          const content = (
            <>
              {card.imageSrc ? <img className="standard-card-image" src={card.imageSrc} alt={card.imageAlt ?? card.title} loading="lazy" /> : null}
              <strong>{card.title}</strong>
              <span>{card.text}</span>
              {card.kicker ? <span className="standard-card-kicker">{card.kicker}</span> : null}
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

function DetailSections({ page }: { page: StandardPage }) {
  if (!page.detailSections?.length) return null;

  return (
    <section className="container section-block standard-detail-stack">
      {page.detailSections.map((section) => {
        const imageFirst = section.image && section.imagePosition === "left";
        const copy = (
          <div className="standard-detail-copy">
            {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.note ? <p className="standard-detail-note">{section.note}</p> : null}
            {section.link ? (
              <div className="standard-detail-actions">
                <a className="button-secondary" href={section.link.href} {...externalAttrs(section.link.external)}>
                  {section.link.label}
                </a>
              </div>
            ) : null}
          </div>
        );

        const media = section.image ? (
          <figure className="standard-detail-media">
            <img src={section.image.src} alt={section.image.alt} loading="lazy" />
            {section.image.caption ? <figcaption>{section.image.caption}</figcaption> : null}
          </figure>
        ) : null;

        return (
          <article className="standard-detail-card" key={section.title}>
            <div className={`standard-detail-grid${section.image ? " has-media" : ""}`}>
              {imageFirst ? media : null}
              {copy}
              {!imageFirst ? media : null}
            </div>
          </article>
        );
      })}
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
        <p>Hier findest du die wichtigsten Facebook- und YouTube-Einstiege, wenn du ab50.de auch außerhalb der Plattform begleiten möchtest.</p>
      </div>
      <div className="card-grid standard-card-grid social-card-grid">
        {page.socialLinks.map((link) => (
          <a className={`card standard-card social-card social-card-${link.platform}`} href={link.href} key={link.href} {...externalAttrs(link.external)}>
            <div className="social-card-top">
              <span className={`social-icon social-icon-${link.platform}`}>
                <SocialIcon platform={link.platform} />
              </span>
              <div className="social-card-meta">
                <small>{link.platform === "facebook" ? "Facebook" : "YouTube"}</small>
                <span>{link.kind}</span>
              </div>
            </div>
            <strong>{link.label}</strong>
            <span>{link.text}</span>
            <div className="social-card-footer">
              <em>{getSocialActionLabel(link)}</em>
              <span className="social-card-arrow" aria-hidden="true">
                <SocialArrowIcon />
              </span>
            </div>
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
          <p className="eyebrow">Bewertungen prüfen</p>
          <h2>Schau selbst auf Trustpilot & Co.</h2>
          <p>Schau dir die aktuelle Bewertungen an – du siehst immer das echte Feedback von echten Nutzern, nicht alte Momentaufnahmen.</p>
        </div>
        <div className="city-cta-box city-cta-box-compact">
          <p className="eyebrow">Probieren geht über Studieren</p>
          <h2>Teste ab50.de kostenlos</h2>
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
      {page.detailSections?.length ? <DetailSections page={page} /> : null}
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
