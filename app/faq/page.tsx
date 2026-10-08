import type { Metadata } from "next";
import faq from "@/data/faq.json";
import { CtaBand } from "@/components/ab-city/city-parts";
import { ArrowIcon, HeartIcon, ShieldIcon, StarIcon, UsersIcon } from "@/components/ab-icons";
import { FaqBrowser, type FaqSection } from "@/components/ab-info/faq-browser";
import { LightHero } from "@/components/ab-info/info-parts";
import { siteConfig } from "@/data/site";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { marketPartnersuchePath } from "@/lib/markets";

const FAQ_PATH = "/faq/";
// Dieselbe FAQ für DE, AT und CH: /at/faq/ und /ch/faq/ zeigen den deutschen Text, Canonical ist die DE-Fassung.
const TITLE = "Häufige Fragen zu ab50.de (FAQ)";
const DESCRIPTION = "Antworten zu Kosten, Sicherheit, Profil und Ablauf bei ab50.de, der Partnersuche für Singles ab 50.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: FAQ_PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl(FAQ_PATH), type: "website", locale: "de_DE" },
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&auml;/g, "ä").replace(/&ouml;/g, "ö").replace(/&uuml;/g, "ü").replace(/&Auml;/g, "Ä").replace(/&Ouml;/g, "Ö").replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß").replace(/&ndash;/g, "–").replace(/&bdquo;/g, "„").replace(/&ldquo;/g, "“").replace(/&quot;/g, "\"").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const sections: FaqSection[] = faq.sections.map((section) => ({
  id: slugify(section.title),
  title: section.title,
  introHtml: section.intro.join(""),
  outroHtml: section.outro.join(""),
  highlight: /transparenz/i.test(section.title),
  items: section.items,
}));

const SERVICE = [
  { href: "https://ab50.de/hilfe/", icon: UsersIcon, title: "Hilfe & Support", text: "Antworten zur Bedienung und Kontakt zum Support-Team." },
  { href: "https://ab50.de/sicherheit-und-datenschutz.html", icon: ShieldIcon, title: "Sicherheit & Datenschutz", text: "Wie deine Daten geschützt werden und woran du unseriöse Kontakte erkennst." },
  { href: "https://ab50.de/kostenlose-basis-mitgliedschaft.html", icon: StarIcon, title: "Basis-Mitgliedschaft", text: "Was die kostenlose Anmeldung enthält." },
];

export default function FaqPage() {
  const partnersuche = marketPartnersuchePath("de");
  const questionCount = sections.reduce((sum, section) => sum + section.items.length, 0);
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: TITLE,
    url: absoluteUrl(FAQ_PATH),
    inLanguage: "de-DE",
    mainEntity: sections.flatMap((section) => section.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: plainText(item.answerHtml) },
    }))),
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ab50.de", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "FAQ", item: absoluteUrl(FAQ_PATH) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <article className="abi">
        <LightHero
          crumbs={[{ label: "ab50.de", href: siteConfig.links.home }, { label: "FAQ" }]}
          eyebrow={<><HeartIcon />Fragen &amp; Antworten</>}
          title={faq.h1}
          lead={<div dangerouslySetInnerHTML={{ __html: faq.introHtml }} />}
        >
          <ul className="abi-chips">
            <li><strong>{questionCount}</strong> Antworten</li>
            <li><strong>{sections.length}</strong> Themen</li>
            <li><strong>0 €</strong> Registrierung</li>
          </ul>
        </LightHero>

        <FaqBrowser sections={sections} />

        <section className="ab-wrap ab-section" aria-label="Weitere Hilfe">
          <div className="abi-tiles">
            {SERVICE.map(({ href, icon: Icon, title, text }) => (
              <a key={href} className="abi-tile" href={href}>
                <Icon /><strong>{title}</strong><span>{text}</span><em>Weiterlesen <ArrowIcon /></em>
              </a>
            ))}
          </div>
        </section>

        <CtaBand
          eyebrow="Direkter Einstieg"
          title="Noch Fragen offen? Schau dich in Ruhe um."
          text="Du kannst kostenlos starten, Profile ansehen und selbst entscheiden, ob ab50.de zu deinem Tempo passt."
          primary={{ label: "Jetzt kostenlos registrieren", href: siteConfig.links.registrationCommon }}
          secondary={{ label: "Stadtseiten ansehen", href: partnersuche.publicUrl, previewHref: partnersuche.previewPath }}
        />
      </article>
    </>
  );
}
