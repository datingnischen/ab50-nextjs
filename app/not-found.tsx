import type { Metadata } from "next";
import { CompassIcon, PinIcon } from "@/components/ab-icons";
import { CtaBand } from "@/components/ab-city/city-parts";
import { siteConfig } from "@/data/site";
import "@/components/ab-city/ab-city.css";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: true },
};

const CITIES = [
  ["Berlin", "singles-berlin"],
  ["Hamburg", "singles-hamburg"],
  ["München", "singles-muenchen"],
  ["Köln", "singles-koeln"],
  ["Frankfurt", "singles-frankfurt-am-main"],
  ["Stuttgart", "singles-stuttgart"],
];

export default function NotFound() {
  return (
    <article className="abc">
      <section className="ab-hero">
        <div className="ab-wrap abc-notfound">
          <span className="ab-badge"><CompassIcon />Hier geht&apos;s nicht weiter</span>
          <h1>Diese Seite gibt es leider nicht (mehr).</h1>
          <p className="ab-lead">Vielleicht hilft dir einer dieser Wege weiter – oder du schaust direkt, wer in deiner Nähe sucht.</p>
          <div className="ab-actions">
            <a className="ab-btn ab-btn-primary" href="/magazin/">Zum 50plus Magazin</a>
            <a className="ab-btn ab-btn-ghost" href="/partnersuche/">Alle Städte ansehen</a>
          </div>
        </div>
      </section>
      <section className="ab-wrap ab-section abc-notfound-cities" aria-labelledby="abc-nf-title">
        <h2 id="abc-nf-title">Beliebte Stadtseiten</h2>
        <ul>
          {CITIES.map(([name, slug]) => (
            <li key={slug}><a href={`/partnersuche/${slug}/`}><PinIcon />Singles ab 50 in {name}</a></li>
          ))}
        </ul>
      </section>
      <CtaBand
        eyebrow="Kostenlos starten"
        title="Neue Menschen ab 50 kennenlernen"
        text="Profil kostenlos anlegen und in Ruhe schauen, wer in deiner Region zu dir passen könnte."
        primary={{ label: "Kostenlos starten", href: siteConfig.links.registrationCommon }}
        secondary={{ label: "Zum Magazin", href: "/magazin/" }}
      />
    </article>
  );
}
