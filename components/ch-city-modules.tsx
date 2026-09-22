import Image from "next/image";
import type { ChCityFacts, ChPlace } from "@/data/ch-city-facts";

/**
 * Inhaltsmodule der Schweizer Stadtseiten.
 *
 * Bewusst dieselben CSS-Klassen wie auf den deutschen Stadtseiten
 * (`flirt-factor-card`, `city-stats-grid`, `place-card-grid`,
 * `magazine-author-box`), damit beide Märkte identisch aussehen.
 */

export const chCityAuthor = {
  name: "Christian M. Haas",
  role: "Autor & Dating-Experte bei ab50.ch",
  imageSrc: "https://ab50.de/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png",
  imageAlt: "Christian M. Haas",
  // Das Magazin liegt auf ab50.de; auf dem Schweizer Host ist /magazin nicht erreichbar.
  href: "https://ab50.de/magazin/christian-m-haas",
};

export function flirtFactorHeadline(score: number) {
  if (score >= 85) return "Sehr aktiv: viele echte Singles zum Kennenlernen";
  if (score >= 78) return "Aktiv und lebendig: gute Chancen auf neue Kontakte";
  if (score >= 70) return "Gute Dating-Chancen: Singles mit deinen Interessen";
  if (score >= 62) return "Solide: reguläre Dating-Aktivität erwartet";
  return "Kleinere Szene: braucht etwas Geduld, aber echte Chancen";
}

export function ChFlirtFactorCard({ cityName, score, text }: { cityName: string; score: number; text: string }) {
  const safeScore = Math.max(0, Math.min(100, score));
  return (
    <div className="flirt-factor-card" aria-label={`Flirt-Faktor ${cityName}`}>
      <div>
        <span className="flirt-factor-kicker">Flirt-Faktor</span>
        <strong>{safeScore}/100</strong>
        <p>{text}</p>
      </div>
      <div className="flirt-meter" aria-hidden="true">
        <span style={{ width: `${safeScore}%` }} />
      </div>
    </div>
  );
}

export function ChCityStats({ cityName, facts }: { cityName: string; facts: ChCityFacts }) {
  const haushalte = facts.einpersonenhaushalte;
  const cards = [
    {
      label: "Flirt-Faktor",
      value: `${facts.flirtFaktor}/100`,
      description: `Zeigt auf einen Blick, wie leicht du in ${cityName} neue Leute kennenlernen kannst.`,
    },
    {
      label: "Einwohner",
      value: facts.einwohner,
      description: facts.einwohnerHinweis,
    },
    haushalte
      ? {
          label: "Single-Haushalte",
          value: `${haushalte.prozent} %`,
          description: haushalte.hinweis,
        }
      : {
          label: facts.dritteKachel.label,
          value: facts.dritteKachel.wert,
          description: facts.dritteKachel.beschreibung,
        },
  ];

  return (
    <section className="city-stats-grid" aria-label={`Stadtfakten für ${cityName}`}>
      {cards.map((card) => (
        <article className="city-stat-card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <p>{card.description}</p>
        </article>
      ))}
    </section>
  );
}

function mapsUrl(place: ChPlace, cityName: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${cityName}, Schweiz`)}`;
}

export function ChPlaceCards({ cityName, places }: { cityName: string; places: ChPlace[] }) {
  if (!places.length) return null;
  return (
    <section className="city-places-section" aria-label={`Date-Orte in ${cityName}`}>
      <div className="section-heading compact-heading place-section-heading">
        <p className="eyebrow">Date-Ideen in {cityName}</p>
        <h2>{places.length} konkrete Orte für Dates in {cityName}</h2>
        <p>Diese Treffpunkte nennt auch das Stadtporträt weiter unten – sie eignen sich für ein erstes Kennenlernen oder einen entspannten nächsten Schritt.</p>
      </div>
      <div className="place-card-grid">
        {places.map((place) => (
          <article className="place-card place-card-slim" key={place.name}>
            <div className="place-card-topline">
              <span className="place-type-badge">📍 {place.typ}</span>
              <span className="place-category-badge">{place.kategorie}</span>
            </div>
            <h3>{place.name}</h3>
            <p className="place-card-text">{place.tipp}</p>
            <dl className="place-meta-list place-meta-list-slim">
              <div>
                <dt>Ort</dt>
                <dd>{cityName}, Schweiz</dd>
              </div>
            </dl>
            <div className="place-actions place-actions-slim">
              <a href={mapsUrl(place, cityName)} rel="nofollow noopener noreferrer" target="_blank">Karte öffnen</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ChCityAuthorBox({ cityName }: { cityName: string }) {
  return (
    <section className="magazine-author-box city-author-box" aria-label="Wer diese Inhalte schreibt">
      <div className="magazine-author-avatar" aria-hidden="true">
        <Image src={chCityAuthor.imageSrc} alt={chCityAuthor.imageAlt} width={96} height={96} />
      </div>
      <div>
        <p className="eyebrow">Von {chCityAuthor.name}</p>
        <p className="magazine-author-role">{chCityAuthor.role}</p>
        <p>Hier findest du Ideen für erste Dates in {cityName}, typische Fragen rund ums Kennenlernen und einen einfachen Einstieg, wenn du neue Menschen ab 50 treffen möchtest.</p>
        <div className="magazine-author-meta">
          <span>Treffpunkte in {cityName}</span>
          <span>Erste Dates ab 50</span>
          <span>Schweiz</span>
        </div>
        <a
          className="button-secondary magazine-author-link"
          href={chCityAuthor.href}
          rel="noopener"
        >
          Mehr von Christian lesen
        </a>
      </div>
    </section>
  );
}

export function ChFlirtFactorNote({ cityName, score }: { cityName: string; score: number }) {
  return (
    <section className="city-source-box" aria-label="Wie der Flirt-Faktor entsteht">
      <p className="eyebrow">Flirt-Faktor {cityName}</p>
      <p>
        Der Flirt-Faktor ({score}/100) ist eine redaktionelle Einschätzung von ab50.ch. Er berücksichtigt die
        Kontaktbasis der Stadt, die Vielfalt der Quartiere und die Qualität der Treffpunkte für entspannte Dates
        ab 50 – er ist keine amtliche Statistik. Einwohner-, Quartiers- und Treffpunktangaben stammen aus dem
        Stadtporträt auf dieser Seite.
      </p>
    </section>
  );
}
