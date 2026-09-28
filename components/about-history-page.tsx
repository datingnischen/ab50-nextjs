import Image from "next/image";
import type { StaticImageData } from "next/image";
import shot2001 from "../public/history/ab50-20010217133117.png";
import shot2013 from "../public/history/ab50-2013-wayback-raw.png";
import shot2024 from "../public/history/ab50-20240414141455.png";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { siteConfig } from "@/data/site";
import { ABOUT_HISTORY_PATH } from "@/lib/about-pages";
import { ab50HistorySnapshots } from "@/data/about-history";
import { marketPartnersuchePath } from "@/lib/markets";
import { AboutSubnav, LightHero } from "@/components/ab-info/info-parts";
import { CtaBand } from "@/components/ab-city/city-parts";
import { ArrowIcon, CalendarIcon } from "@/components/ab-icons";

const snapshotImages: Record<string, StaticImageData> = {
  "2001": shot2001,
  "2013": shot2013,
  "2024": shot2024,
};

export function AboutHistoryPage() {
  const partnersuche = marketPartnersuchePath("de");
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
      <article className="abi">
        <LightHero
          crumbs={[{ label: "Magazin", href: "/magazin/" }, { label: "Über uns", href: "/ueber-uns/" }, { label: "Geschichte" }]}
          eyebrow={<><CalendarIcon />Unsere Reise</>}
          title="Unsere Geschichte"
          lead="Anhand ausgewählter Wayback-Snapshots wird sichtbar, wie sich ab50.de über die Jahre verändert hat – von sehr frühen Web-Spuren bis zu einer klaren 50plus-Plattform mit Magazin, Vertrauen und modernen Einstiegen."
        >
          <nav className="abi-years" aria-label="Jahresnavigation">
            {ab50HistorySnapshots.map((item) => <a key={item.year} href={`#jahr-${item.year}`}>{item.year}</a>)}
          </nav>
        </LightHero>

        <AboutSubnav current={ABOUT_HISTORY_PATH} />

        <section className="ab-wrap ab-section abi-timeline">
          {ab50HistorySnapshots.map((item, index) => (
            <article key={item.year} id={`jahr-${item.year}`} className={`abi-step${index % 2 ? " abi-step-flip" : ""}`}>
              <span className="abi-step-year">{item.year}</span>
              <div className="abi-step-copy">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <a className="abi-step-link" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.sourceLabel} <ArrowIcon /></a>
              </div>
              <div className="abi-step-shot">
                <Image
                  src={snapshotImages[item.year]}
                  alt={item.imageAlt}
                  sizes="(max-width: 980px) 100vw, 54vw"
                  unoptimized
                />
              </div>
            </article>
          ))}
        </section>

        <CtaBand
          eyebrow="Heute"
          title="Die Entwicklung geht weiter"
          text="Aus frühen, teils sehr schlichten Web-Spuren ist eine Plattform entstanden, die Singles ab 50 Orientierung, Magazin-Inhalte und direkte Einstiege in die Partnersuche bietet."
          primary={{ label: "Jetzt kostenlos registrieren", href: siteConfig.links.registrationCommon }}
          secondary={{ label: "Partnersuche nach Städten", href: partnersuche.publicUrl, previewHref: partnersuche.previewPath }}
        />
      </article>
    </>
  );
}
