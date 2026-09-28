import type { Metadata } from "next";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import { SiteSearchForm } from "@/components/site-search-form";
import { ABOUT_HISTORY_PATH, ABOUT_REVIEWS_PATH, ABOUT_SOCIAL_PATH, ABOUT_ROOT_PATH } from "@/lib/about-pages";
import { getStandardPage } from "@/data/standard-pages";
import { marketPartnersuchePath } from "@/lib/markets";
import { AboutSubnav, LightHero } from "@/components/ab-info/info-parts";
import { CtaBand } from "@/components/ab-city/city-parts";
import { ArrowIcon, BookIcon, CalendarIcon, EyeIcon, HeartIcon, ShieldIcon, StarIcon, TagIcon, UserIcon, UsersIcon } from "@/components/ab-icons";

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

const AUTHOR_IMAGE = "https://ab50.de/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png";

const VALUES = [
  { icon: TagIcon, title: "Kostenlos starten", text: "Profil anlegen, durchstöbern und Nachrichten schreiben – ohne versteckte Kosten und ohne Abo, um dich umzusehen." },
  { icon: EyeIcon, title: "Echte, geprüfte Profile", text: "Verifizierte Profile und eine sichere Nachrichtenbox: damit du echten Menschen mit Lebenserfahrung begegnest." },
  { icon: HeartIcon, title: "In deinem Tempo", text: "Ruhige Bedienung, klare Sprache und Tipps aus dem Magazin – für Singles ab 50, die es ernst meinen." },
];

const MORE = [
  { href: ABOUT_HISTORY_PATH, icon: CalendarIcon, title: "Unsere Geschichte", text: "Gegründet 2011. Von frühen Web-Spuren bis zur heutigen 50plus-Plattform – mit Snapshots aus dem Webarchiv.", cta: "Zur Geschichte" },
  { href: ABOUT_REVIEWS_PATH, icon: StarIcon, title: "Bewertungen & Erfahrungen", text: "Trustpilot, Vergleichsportale und echtes Nutzerfeedback – keine gekauften Bewertungen.", cta: "Bewertungen lesen" },
  { href: ABOUT_SOCIAL_PATH, icon: UsersIcon, title: "Social Media", text: "Facebook-Seite, Community-Gruppe und YouTube: Tipps, Videos und Austausch rund um Dating ab 50.", cta: "Kanäle ansehen" },
  { href: "/magazin/christian-m-haas/", icon: UserIcon, title: "Christian M. Haas", text: "Autor und Dating-Experte: seit 2008 entwickelt und betreibt er seriöse Singlebörsen mit Fokus auf klare Bedienung.", cta: "Zum Autorenprofil" },
  { href: "/magazin/", icon: BookIcon, title: "50plus Magazin", text: "Wie du ein starkes Profil schreibst, Fakes erkennst, sicher bleibst und neue Menschen kennenlernst.", cta: "Zum Magazin" },
  { href: "https://ab50.de/sicherheit-und-datenschutz.html", icon: ShieldIcon, title: "Sicherheit & Datenschutz", text: "Wie ab50.de deine Daten schützt und woran du unseriöse Kontakte erkennst.", cta: "Weiterlesen" },
];

export default function UeberUnsPage() {
  const reviews = getStandardPage("bewertungen-und-erfahrungen");
  const social = getStandardPage("social-media");
  const partnersuche = marketPartnersuchePath("de");
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Über ab50.de",
    headline: "Über ab50.de",
    description: "Hintergründe, Social Media und Bewertungen rund um ab50.de auf einen Blick.",
    url: absoluteUrl(ABOUT_ROOT_PATH),
    inLanguage: "de-DE",
    about: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.links.home,
      foundingDate: "2011",
      sameAs: [...(social.socialLinks?.map((link) => link.href) ?? []), "https://www.trustpilot.com/review/ab50.de"],
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <article className="abi">
        <LightHero
          crumbs={[{ label: "Magazin", href: "/magazin/" }, { label: "Über uns" }]}
          eyebrow={<><HeartIcon />Hinter den Kulissen</>}
          title="Über ab50.de"
          lead="ab50.de: Kostenlos Singles 50+ kennenlernen, Nachrichten schreiben, erste Dates planen. Ohne versteckte Kosten, mit echten, verifizierten Profilen."
          aside={
            <figure className="abi-frame">
              {/* eslint-disable-next-line @next/next/no-img-element -- Autorenfoto aus WordPress */}
              <img src={AUTHOR_IMAGE} alt="Christian M. Haas, Autor und Dating-Experte bei ab50.de" width={243} height={300} />
              <figcaption><strong>Christian M. Haas</strong><span>Autor &amp; Dating-Experte</span></figcaption>
            </figure>
          }
        >
          <ul className="abi-chips">
            <li><strong>2011</strong> gegründet</li>
            <li><strong>4,6</strong> / 5 auf Trustpilot</li>
            <li><strong>0 €</strong> Registrierung</li>
          </ul>
          <div className="abi-search">
            <SiteSearchForm label="Magazin-Artikel und Stadtseiten durchsuchen" />
          </div>
        </LightHero>

        <AboutSubnav current={ABOUT_ROOT_PATH} />

        <section className="ab-wrap ab-section" aria-labelledby="abi-values-title">
          <div className="ab-head">
            <p className="ab-eyebrow"><HeartIcon />Wofür wir stehen</p>
            <h2 id="abi-values-title">Partnersuche mit Lebenserfahrung</h2>
          </div>
          <div className="abi-values">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <article key={title}><Icon /><strong>{title}</strong><p>{text}</p></article>
            ))}
          </div>
        </section>

        <section className="ab-wrap ab-section">
          <figure className="abi-quote">
            <span className="abi-quote-mark" aria-hidden="true">“</span>
            <blockquote>
              Mein Schwerpunkt liegt darauf, Online-Dating nicht nur technisch zuverlässig, sondern auch alltagstauglich und verständlich zu gestalten.
            </blockquote>
            <figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element -- Autorenfoto aus WordPress */}
              <img src={AUTHOR_IMAGE} alt="" width={56} height={69} loading="lazy" />
              <span><strong>Christian M. Haas</strong><small>Autor &amp; Dating-Experte bei ab50.de</small></span>
            </figcaption>
          </figure>
        </section>

        <section className="ab-section abi-ratings" aria-labelledby="abi-ratings-title">
          <div className="ab-wrap">
            <div className="abi-ratings-head">
              <div className="ab-head">
                <p className="ab-eyebrow"><StarIcon />Bewertungen &amp; Erfahrungen</p>
                <h2 id="abi-ratings-title">Was andere über ab50.de sagen</h2>
              </div>
              <a className="ab-btn ab-btn-primary" href={ABOUT_REVIEWS_PATH}>Alle Bewertungen <ArrowIcon /></a>
            </div>
            <div className="abi-ratings-grid">
              <div className="abi-rating">
                <small>Trustpilot</small>
                <strong>4,6<span> / 5</span></strong>
                <span className="ab-stars" style={{ ["--rating" as string]: 4.6 }} role="img" aria-label="4,6 von 5 Sternen" />
              </div>
              <div className="abi-rating">
                <small>Singlebörsen-Überblick</small>
                <strong>4,5<span> / 5</span></strong>
                <span className="ab-stars" style={{ ["--rating" as string]: 4.5 }} role="img" aria-label="4,5 von 5 Sternen" />
              </div>
              <div className="abi-rating abi-rating-text">
                <small>Seit 2011</small>
                <strong>Singles 50+</strong>
                <span>{reviews.cards?.[0]?.title}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="ab-wrap ab-section" aria-labelledby="abi-more-title">
          <div className="ab-head">
            <p className="ab-eyebrow"><BookIcon />Mehr erfahren</p>
            <h2 id="abi-more-title">Wer hinter ab50.de steht</h2>
            <p>ab50.de wird von klaren Köpfen geprägt: Christian M. Haas mit langjähriger Dating-Erfahrung im Magazin, ICONY als Betreiber und technischer Partner – und vor allem von dir und der Community.</p>
          </div>
          <div className="abi-tiles">
            {MORE.map(({ href, icon: Icon, title, text, cta }) => (
              <a key={href} className="abi-tile" href={href}>
                <Icon /><strong>{title}</strong><span>{text}</span><em>{cta} <ArrowIcon /></em>
              </a>
            ))}
          </div>
          <p className="abi-note">Im Hintergrund wird ab50.de von <a href="https://www.icony.com/">ICONY</a> begleitet. ICONY ist der Betreiber und rechtliche Ansprechpartner der Plattform und kümmert sich um Support, technische Betreuung und die laufende Weiterentwicklung.</p>
        </section>

        <CtaBand
          eyebrow="Direkter Einstieg"
          title="Wenn du nicht nur lesen, sondern direkt loslegen möchtest"
          text="Du kannst jederzeit kostenlos starten, Profile ansehen und selbst entscheiden, ob ab50.de zu deinem Tempo passt."
          primary={{ label: "Jetzt kostenlos registrieren", href: siteConfig.links.registrationCommon }}
          secondary={{ label: "Stadtseiten ansehen", href: partnersuche.publicUrl, previewHref: partnersuche.previewPath }}
        />
      </article>
    </>
  );
}
