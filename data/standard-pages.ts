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
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  template: "trust" | "social";
  highlights: string[];
  cards?: Card[];
  socialLinks?: SocialLink[];
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
    description: "Einordnung von Nutzerfeedback, Vergleichsportalen und Erfahrungen mit ab50.de.",
    lead:
      "Wer eine Singlebörse ab 50 ausprobiert, möchte wissen, wie andere sie erleben. Hier findest du einen kompakten Überblick über externe Bewertungen, Vergleichsseiten und wichtige Hinweise, damit du dir ein realistisches Bild machen kannst.",
    primaryCtaLabel: "ab50.de kostenlos ausprobieren",
    primaryCtaHref: registrationHref,
    secondaryCtaLabel: "Zur Social-Media-Seite",
    secondaryCtaHref: ABOUT_SOCIAL_PATH,
    template: "trust",
    highlights: ["echte Nutzerstimmen", "externe Bewertungsseiten", "Vergleichsportale", "transparent einordnen"],
    cards: [
      {
        title: "Warum Nutzerfeedback wichtig ist",
        text:
          "Bei ab50.de stehen die Erfahrungen der Mitglieder im Mittelpunkt. Positive Rückmeldungen zeigen, was bereits gut funktioniert, und kritische Hinweise helfen dabei, die Plattform weiter zu verbessern.",
      },
      {
        title: "Bewertungen auf Trustpilot",
        text:
          "Viele Mitglieder bewerten ab50.de auf Trustpilot sehr positiv. Besonders häufig genannt werden die einfache Bedienung, der klare Fokus auf Singles ab 50 und die ruhige Ausrichtung der Plattform.",
        href: "https://www.trustpilot.com/review/ab50.de",
        label: "Trustpilot öffnen",
      },
      {
        title: "Empfehlungen auf Vergleichsseiten",
        text:
          "ab50.de wird regelmäßig auf Vergleichsportalen wie Singleboersen-Überblick.de eingeordnet. Dort findest du zusätzliche Perspektiven auf Zielgruppe, Funktionen und Gesamteindruck.",
        href: "https://singleboersen-ueberblick.de/partnersuche/ab50/",
        label: "Vergleich ansehen",
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
