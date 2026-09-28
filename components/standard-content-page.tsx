import { absoluteUrl, jsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import type { StandardPage } from "@/data/standard-pages";
import { marketPartnersuchePath } from "@/lib/markets";
import { AboutSubnav, LightHero } from "@/components/ab-info/info-parts";
import { CtaBand } from "@/components/ab-city/city-parts";
import { ArrowIcon, StarIcon, UsersIcon } from "@/components/ab-icons";

function externalAttrs(external?: boolean) {
  return external ? { target: "_blank", rel: "noopener noreferrer" } : undefined;
}

function SocialIcon({ platform }: { platform: "facebook" | "youtube" }) {
  if (platform === "youtube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3Z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8V11H8v2.8h2.5V21Z" />
    </svg>
  );
}

function getSocialActionLabel(link: NonNullable<StandardPage["socialLinks"]>[number]) {
  if (link.ctaLabel) return link.ctaLabel;
  if (link.platform === "youtube") return "Videos ansehen";
  return link.kind.toLowerCase().includes("gruppe") ? "Gruppe öffnen" : "Seite ansehen";
}

function ReviewsBody({ page }: { page: StandardPage }) {
  return (
    <>
      {page.cards?.length ? (
        <section className="ab-wrap ab-section" aria-labelledby="abi-cards-title">
          <div className="ab-head">
            <p className="ab-eyebrow"><StarIcon />Das solltest du wissen</p>
            <h2 id="abi-cards-title">Echte Erfahrungen &amp; externe Bewertungen</h2>
          </div>
          <div className="abi-review-grid">
            {page.cards.map((card) => {
              const rating = card.text.match(/(\d,\d) von 5 Sternen/)?.[1];
              const inner = (
                <>
                  <header>
                    {rating ? (
                      <div className="abi-review-score">
                        <strong>{rating}<span> / 5</span></strong>
                        <span className="ab-stars" style={{ ["--rating" as string]: Number(rating.replace(",", ".")) }} role="img" aria-label={`${rating} von 5 Sternen`} />
                      </div>
                    ) : null}
                    {/* eslint-disable-next-line @next/next/no-img-element -- Siegel aus dem ICONY-CMS */}
                    {card.imageSrc ? <img className="abi-seal" src={card.imageSrc} alt={card.imageAlt ?? card.title} loading="lazy" /> : null}
                  </header>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  {card.label ? <em>{card.label} <ArrowIcon /></em> : null}
                </>
              );
              return card.href ? (
                <a className="abi-review" href={card.href} key={card.title} {...externalAttrs(card.href.startsWith("http"))}>{inner}</a>
              ) : (
                <article className="abi-review" key={card.title}>{inner}</article>
              );
            })}
          </div>
        </section>
      ) : null}

      {page.detailSections?.length ? (
        <section className="ab-wrap ab-section abi-details">
          {page.detailSections.map((section, index) => (
            <article key={section.title} className={`abi-detail${section.image ? " abi-detail-media" : ""}${index % 2 ? " abi-detail-flip" : ""}`}>
              <div>
                {section.eyebrow ? <p className="ab-eyebrow">{section.eyebrow}</p> : null}
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.note ? <p className="abi-detail-note">{section.note}</p> : null}
                {section.link ? (
                  <a className="ab-btn ab-btn-outline ab-btn-small" href={section.link.href} {...externalAttrs(section.link.external)}>{section.link.label} <ArrowIcon /></a>
                ) : null}
              </div>
              {section.image ? (
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Bild aus dem ICONY-CMS */}
                  <img src={section.image.src} alt={section.image.alt} loading="lazy" />
                  {section.image.caption ? <figcaption>{section.image.caption}</figcaption> : null}
                </figure>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}
    </>
  );
}

function SocialBody({ page }: { page: StandardPage }) {
  if (!page.socialLinks?.length) return null;
  return (
    <section className="ab-wrap ab-section" aria-labelledby="abi-social-title">
      <div className="ab-head">
        <p className="ab-eyebrow"><UsersIcon />Kanäle &amp; Community</p>
        <h2 id="abi-social-title">Social-Media-Übersicht</h2>
        <p>Hier findest du die wichtigsten Facebook- und YouTube-Einstiege, wenn du ab50.de auch außerhalb der Plattform begleiten möchtest.</p>
      </div>
      <div className="abi-channels">
        {page.socialLinks.map((link) => (
          <a className={`abi-channel abi-channel-${link.platform}`} href={link.href} key={link.href} {...externalAttrs(link.external)}>
            <span className="abi-channel-icon"><SocialIcon platform={link.platform} /></span>
            <small>{link.platform === "facebook" ? "Facebook" : "YouTube"} · {link.kind}</small>
            <strong>{link.label}</strong>
            <span>{link.text}</span>
            <em>{getSocialActionLabel(link)} <ArrowIcon /></em>
          </a>
        ))}
      </div>
    </section>
  );
}

export function StandardContentPage({ page }: { page: StandardPage }) {
  const partnersuche = marketPartnersuchePath("de");
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
    <article className={`abi standard-page-${page.template}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <LightHero
        crumbs={[{ label: "Magazin", href: "/magazin/" }, { label: "Über uns", href: "/ueber-uns/" }, { label: page.navLabel }]}
        eyebrow={page.template === "trust" ? <><StarIcon />{page.eyebrow}</> : <><UsersIcon />{page.eyebrow}</>}
        title={page.title}
        lead={page.lead}
        aside={page.heroImageSrc ? (
          <figure className="abi-frame">
            {/* eslint-disable-next-line @next/next/no-img-element -- Bild aus dem ICONY-CMS */}
            <img src={page.heroImageSrc} alt={page.heroImageAlt ?? page.title} />
            <span className="abi-frame-badge" aria-hidden="true"><StarIcon /></span>
          </figure>
        ) : undefined}
      >
        <ul className="abi-chips">
          {page.highlights.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className="abi-hero-actions">
          <a className="ab-btn ab-btn-primary" href={page.primaryCtaHref}>{page.primaryCtaLabel}</a>
          {page.secondaryCtaHref && page.secondaryCtaLabel ? <a className="ab-btn ab-btn-outline" href={page.secondaryCtaHref}>{page.secondaryCtaLabel}</a> : null}
        </div>
      </LightHero>

      <AboutSubnav current={page.href} />

      {page.template === "trust" ? <ReviewsBody page={page} /> : <SocialBody page={page} />}

      <CtaBand
        eyebrow={page.template === "trust" ? "Probieren geht über Studieren" : "Vom Austausch zum Kennenlernen"}
        title={page.template === "trust" ? "Teste ab50.de kostenlos" : "Bereit, neue Singles kennenzulernen?"}
        text="Schau dich in Ruhe um, entdecke passende Kontakte und entscheide selbst, wen du näher kennenlernen möchtest."
        primary={{ label: "Jetzt kostenlos registrieren", href: siteConfig.links.registrationCommon }}
        secondary={{ label: "Partnersuche nach Städten", href: partnersuche.publicUrl, previewHref: partnersuche.previewPath }}
      />
    </article>
  );
}
