import { siteConfig } from "@/data/site";
import { ABOUT_REVIEWS_PATH, ABOUT_SOCIAL_PATH } from "@/lib/about-pages";

export type StandardPageSlug = "bewertungen-und-erfahrungen" | "social-media";

type Link = {
  label: string;
  href: string;
  external?: boolean;
};

type Card = {
  title: string;
  text: string;
  href?: string;
  label?: string;
  kicker?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type MediaAsset = {
  src: string;
  alt: string;
  caption?: string;
};

type DetailSection = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  image?: MediaAsset;
  imagePosition?: "left" | "right";
  link?: Link;
  note?: string;
};

type SocialLink = Link & {
  text: string;
  platform: "facebook" | "youtube";
  kind: string;
  ctaLabel?: string;
};

export type StandardPage = {
  slug: StandardPageSlug;
  href: `/${string}`;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  lead: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  template: "trust" | "social";
  highlights: string[];
  cards?: Card[];
  socialLinks?: SocialLink[];
  detailSections?: DetailSection[];
  seo: {
    title: string;
    description: string;
  };
};

const registrationHref = siteConfig.links.registrationCommon;

export const standardPages: Record<StandardPageSlug, StandardPage> = {
  "bewertungen-und-erfahrungen": {
    slug: "bewertungen-und-erfahrungen",
    href: ABOUT_REVIEWS_PATH,
    navLabel: "Bewertungen & Erfahrungen",
    eyebrow: "Erfahrungen & Vertrauen",
    title: "Bewertungen und Erfahrungen zu ab50.de",
    description: "Authentische Nutzermeinungen, Trustpilot-Bewertungen und Empfehlungen von Vergleichsportalen zu ab50.de.",
    lead:
      "Wer eine Singlebörse ab 50 ausprobiert, möchte wissen, wie andere sie erleben. Hier findest du die wichtigsten Nutzerstimmen, externe Bewertungen und Vergleichsseiten auf einen Blick — nah an den Originalinhalten der bestehenden ab50.de-Seite.",
    heroImageSrc:
      "https://static-cms.icony-hosting.de/cms/CA826BE1645060B73CFA05BDC578548B28A5BE368308A23F30870395AC91734A/400/bewertung-und-erfahrungen-pic.jpg",
    heroImageAlt: "Frau mit Daumen hoch als Motiv für Bewertungen und Erfahrungen",
    primaryCtaLabel: "Zur kostenlosen Registrierung",
    primaryCtaHref: registrationHref,
    secondaryCtaLabel: "Zur Social-Media-Seite",
    secondaryCtaHref: ABOUT_SOCIAL_PATH,
    template: "trust",
    highlights: ["echte Nutzermeinungen", "Trustpilot", "Vergleichsportale", "transparent einordnen"],
    cards: [
      {
        title: "Warum uns echte Nutzermeinungen wichtig sind",
        text:
          "Bei ab50.de stehen unsere Mitglieder im Mittelpunkt – ihr Feedback hilft uns, die Plattform kontinuierlich zu verbessern und optimal an die Bedürfnisse der Silver-Ager-Community anzupassen. Positive Erfahrungen bestärken uns in unserer Arbeit, während konstruktive Kritik zeigt, wo wir noch besser werden können. Ehrlichkeit und Transparenz sind uns wichtig – deshalb geben wir hier einen authentischen Überblick.",
      },
      {
        title: "Hervorragende Bewertungen auf Trustpilot",
        text:
          "Viele unserer Mitglieder bewerten ab50.de auf Trustpilot mit Bestnoten. Besonders geschätzt werden die einfache Bedienbarkeit und die hohe Erfolgsquote. Mit einer Durchschnittsbewertung von 4,6 von 5 Sternen zeigt sich die Zufriedenheit unserer Community.",
        href: "https://www.trustpilot.com/review/ab50.de",
        label: "Trustpilot öffnen",
        kicker: "⭐⭐⭐⭐⭐",
      },
      {
        title: "Empfehlungen auf renommierten Vergleichsseiten",
        text:
          "ab50.de wird regelmäßig von Vergleichsportalen wie Singleboersen-Überblick.de, DatingJunge und Singlebörsen-Vergleich empfohlen. Diese Plattformen heben besonders die benutzerfreundliche Gestaltung und den gezielten Fokus auf Singles über 50 hervor.",
        href: "https://singleboersen-ueberblick.de/partnersuche/ab50/",
        label: "Vergleich ansehen",
        imageSrc:
          "https://static-cms.icony-hosting.de/cms/0AAC065690E55C2E5C07C90516AFDAF309FBFA84E8003071E7240115A5B9F98D/empfohlen-siegel-45sterne-330x60.jpg",
        imageAlt: "Empfohlen-Siegel mit 4,5 Sternen",
      },
    ],
    detailSections: [
      {
        eyebrow: "Originalinhalte übernommen",
        title: "Warum uns echte Nutzermeinungen wichtig sind",
        paragraphs: [
          "Bei ab50.de stehen die Mitglieder im Mittelpunkt – ihr Feedback hilft dabei, die Plattform kontinuierlich weiterzuentwickeln und noch besser auf die Bedürfnisse von Singles ab 50 auszurichten.",
          "Positive Erfahrungen zeigen, was bereits gut funktioniert. Kritische Hinweise sind genauso wertvoll, weil sie konkrete Ansatzpunkte liefern, um Abläufe, Bedienbarkeit und Vertrauen weiter zu stärken.",
          "Transparenz gehört dazu: Wer sich für eine Partnersuche ab 50 entscheidet, soll sich auf nachvollziehbare Einordnungen und einen ehrlichen ersten Eindruck verlassen können.",
        ],
        image: {
          src: "https://static-cms.icony-hosting.de/cms/CA826BE1645060B73CFA05BDC578548B28A5BE368308A23F30870395AC91734A/400/bewertung-und-erfahrungen-pic.jpg",
          alt: "Frau zeigt mit erhobenem Daumen in die Kamera",
          caption: "Das zentrale Bild der ursprünglichen Bewertungsseite wurde in die neue Vercel-Seite übernommen.",
        },
      },
      {
        eyebrow: "Externe Stimmen",
        title: "Hervorragende Bewertungen auf Trustpilot",
        paragraphs: [
          "Viele Mitglieder heben auf Trustpilot besonders die einfache Bedienbarkeit, die ruhige Ausrichtung und den klaren Fokus auf Singles ab 50 hervor.",
          "Gerade für Menschen mit Lebenserfahrung ist wichtig, dass eine Plattform verständlich bleibt und nicht hektisch wirkt. Genau diese Punkte tauchen in den Rückmeldungen immer wieder auf.",
        ],
        note: "⭐⭐⭐⭐⭐",
        link: {
          label: "Trustpilot öffnen",
          href: "https://www.trustpilot.com/review/ab50.de",
          external: true,
        },
      },
      {
        eyebrow: "Weitere Einordnungen",
        title: "Empfehlungen auf Vergleichsseiten",
        paragraphs: [
          "Neben direkten Nutzerbewertungen wird ab50.de auch auf Vergleichsportalen wie Singleboersen-Überblick.de eingeordnet. Dort bekommst du eine zusätzliche Perspektive auf Zielgruppe, Gesamteindruck und Positionierung.",
          "Auf der ursprünglichen Seite wurden außerdem weitere Portale wie DatingJunge und Singlebörsen-Vergleich als ergänzende Orientierung genannt. Diese Einordnungen wurden in die neue Seite textlich übernommen.",
        ],
        image: {
          src: "https://static-cms.icony-hosting.de/cms/0AAC065690E55C2E5C07C90516AFDAF309FBFA84E8003071E7240115A5B9F98D/empfohlen-siegel-45sterne-330x60.jpg",
          alt: "Empfohlen-Siegel mit Sternebewertung",
          caption: "Empfehlungs-Siegel aus der bisherigen Bewertungsseite.",
        },
        imagePosition: "left",
        link: {
          label: "Vergleich ansehen",
          href: "https://singleboersen-ueberblick.de/partnersuche/ab50/",
          external: true,
        },
      },
      {
        eyebrow: "Selbst testen",
        title: "Teste ab50.de selbst",
        paragraphs: [
          "Am Ende zählt immer dein eigener Eindruck. Schau dir Funktionen, Tonalität und potenzielle Kontakte in Ruhe an und entscheide selbst, ob ab50.de zu deiner Art von Partnersuche passt.",
          "So wurde auch die bisherige Seite abgeschlossen: mit einer klaren Einladung, die Plattform unverbindlich selbst kennenzulernen.",
        ],
        link: {
          label: "Zur kostenlosen Registrierung",
          href: registrationHref,
        },
      },
    ],
    seo: {
      title: "Bewertungen und Erfahrungen zu ab50.de",
      description: "Bewertungen, Erfahrungen und externe Einordnungen zu ab50.de: Nutzerfeedback, Trustpilot und Vergleichsportale auf einen Blick.",
    },
  },
  "social-media": {
    slug: "social-media",
    href: ABOUT_SOCIAL_PATH,
    navLabel: "Social Media",
    eyebrow: "ab50.de auf Social Media",
    title: "Folge ab50.de und passenden 50plus-Communities",
    description: "Social-Media-Kanäle und Communities rund um ab50.de, neue Kontakte und Dating ab 50.",
    lead:
      "Auf Social Media findest du Updates, alltagsnahe Dating-Impulse und zusätzliche Orte, an denen Menschen mit Lebenserfahrung miteinander ins Gespräch kommen können.",
    primaryCtaLabel: "Kostenlos registrieren",
    primaryCtaHref: registrationHref,
    secondaryCtaLabel: "Bewertungen ansehen",
    secondaryCtaHref: ABOUT_REVIEWS_PATH,
    template: "social",
    highlights: ["Facebook-Seite", "Facebook-Gruppe", "YouTube", "Tipps & Community"],
    socialLinks: [
      {
        label: "Facebook-Seite",
        href: "https://www.facebook.com/ab50de/",
        text: "Neuigkeiten, Tipps und interessante Beiträge rund um Partnersuche ab 50.",
        platform: "facebook",
        kind: "Offizielle Seite",
        ctaLabel: "Seite ansehen",
        external: true,
      },
      {
        label: "Facebook-Gruppe",
        href: "https://www.facebook.com/groups/414302856141869/",
        text: "Tausche dich mit anderen Singles über 50 aus und knüpfe neue Kontakte in entspannter Atmosphäre.",
        platform: "facebook",
        kind: "Community-Gruppe",
        ctaLabel: "Gruppe öffnen",
        external: true,
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/@ab50de",
        text: "Videos, Erfahrungsberichte und Tipps rund um Partnerschaft, Begegnungen und Dating für Singles ab 50.",
        platform: "youtube",
        kind: "Video-Kanal",
        ctaLabel: "Kanal ansehen",
        external: true,
      },
    ],
    seo: {
      title: "ab50.de auf Social Media",
      description: "Die Social-Media-Kanäle von ab50.de: Facebook-Seite, Community-Gruppe und YouTube rund um Dating ab 50.",
    },
  },
};

export function getStandardPage(slug: StandardPageSlug) {
  return standardPages[slug];
}
