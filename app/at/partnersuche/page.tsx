import type { Metadata } from "next";
import { MarketLink } from "@/components/market-link";
import { CtaBand } from "@/components/ab-city/city-parts";
import { HeartIcon } from "@/components/ab-icons";
import { marketPartnersuchePath, registrationUrl } from "@/lib/markets";
import "@/components/ab-city/ab-overview.css";

// Für Österreich gibt es noch keine eigenen Stadtseiten: Die Länder-URL steht bereit (nginx), die Seite
// verweist auf die deutschen Stadtseiten, bleibt aus dem Index und nennt die Deutschland-Fassung als Canonical.
const germanOverview = marketPartnersuchePath("de");
const description = "Partnersuche ab 50 in Österreich: Eigene Stadtseiten sind in Vorbereitung. Bis dahin findest du Orientierung und den Einstieg über ab50.de.";

export const metadata: Metadata = {
  title: { absolute: "Partnersuche ab 50 in Österreich | ab50.de" },
  description,
  alternates: { canonical: germanOverview.publicUrl },
  robots: { index: false, follow: true },
};

export default function AustrianPartnersuchePage() {
  const registration = registrationUrl("de", "location");

  return (
    <section className="abm city-overview-page market-city-overview-page">
      <div className="ab-hero abm-hero">
        <div className="ab-wrap">
          <span className="ab-badge"><HeartIcon />Partnersuche ab 50 · Österreich</span>
          <h1>Partnersuche ab 50 in Österreich</h1>
          <p className="ab-lead">Eigene Stadtseiten für Österreich sind in Vorbereitung. Bis sie erscheinen, kannst du dich über ab50.de anmelden und die Regionen der Partnersuche nutzen.</p>
          <div className="ab-actions">
            <a className="ab-btn ab-btn-primary" href={registration}>Kostenlos starten</a>
            <MarketLink className="ab-btn ab-btn-ghost" href={germanOverview.publicUrl} previewHref={germanOverview.previewPath}>Stadtseiten in Deutschland</MarketLink>
          </div>
        </div>
      </div>

      <section className="ab-wrap ab-section" aria-label="Partnersuche ab 50 in Österreich">
        <div className="abm-story ab-rich">
          <h2>So findest du Singles ab 50</h2>
          <p>Bei der Partnersuche ab 50 zählen Nähe, ein gemeinsamer Alltag und genug Zeit zum Kennenlernen. Ein Profil legst du kostenlos an. Danach kannst du Menschen aus deiner Region entdecken und selbst entscheiden, wann und wie du den ersten Kontakt knüpfst.</p>
          <p>Die Stadtseiten auf ab50.de zeigen, wie wir eine Region vorstellen: mit Treffpunkten, Ideen für erste Dates und einem direkten Einstieg in die Suche. Für Österreich ergänzen wir solche Seiten, sobald sie fertig sind.</p>
        </div>
      </section>

      <CtaBand
        eyebrow="Bereit für neue Begegnungen?"
        title="Starte kostenlos auf ab50.de."
        text="Du kannst dich in Ruhe umsehen und selbst entscheiden, wie du den ersten Kontakt gestaltest."
        primary={{ label: "Kostenlos starten", href: registration }}
        secondary={{ label: "Stadtseiten in Deutschland", href: germanOverview.publicUrl, previewHref: germanOverview.previewPath }}
      />
    </section>
  );
}
