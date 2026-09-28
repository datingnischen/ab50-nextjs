import type { ReactNode } from "react";
import {
  ArrowIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  CompassIcon,
  HeartIcon,
  PinIcon,
  SparkIcon,
  UsersIcon,
} from "@/components/ab-icons";
import { MarketLink } from "@/components/market-link";
import "./ab-city.css";

/* Gemeinsame Bausteine der Stadtseiten DE und CH (Stadtporträt mit Flirt-Faktor). */

export type Crumb = { label: string; href?: string; previewHref?: string };
export type CtaLink = { label: string; href: string; previewHref?: string };
export type StatCard = { label: string; value: string; description?: string | null };
export type Tip = { title?: string | null; text?: string | null };
export type Place = {
  name: string;
  typeLabel: string;
  category?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  openingHours?: string | null;
  tip?: string | null;
};
export type TocItem = { id: string; label: string };

function LinkOrMarket({ link, className, children }: { link: CtaLink; className?: string; children: ReactNode }) {
  if (link.previewHref) return <MarketLink className={className} href={link.href} previewHref={link.previewHref}>{children}</MarketLink>;
  return <a className={className} href={link.href}>{children}</a>;
}

function formatScore(score: number) {
  return score.toLocaleString("de-DE", { maximumFractionDigits: 1 });
}

/** Flirt-Faktor als Tacho: Ring von 0 bis 100. */
export function FlirtDial({ score, headline, text, cityName }: { score: number | null; headline: string; text?: string | null; cityName: string }) {
  const safe = score === null ? null : Math.max(0, Math.min(100, score));
  const radius = 54;
  const circumference = Math.PI * radius;
  return (
    <aside className="abc-dial-card" aria-label={`Flirt-Faktor ${cityName}`}>
      <span className="abc-dial-kicker"><SparkIcon />Flirt-Faktor</span>
      {safe !== null ? (
        <div className="abc-dial" role="img" aria-label={`${formatScore(safe)} von 100 Punkten`}>
          <svg viewBox="0 0 140 80" aria-hidden="true">
            <defs>
              <linearGradient id="abc-dial-gradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#d9a441" />
                <stop offset="100%" stopColor="#ad1d1d" />
              </linearGradient>
            </defs>
            <path className="abc-dial-track" d="M16 72a54 54 0 0 1 108 0" />
            <path
              className="abc-dial-value"
              d="M16 72a54 54 0 0 1 108 0"
              stroke="url(#abc-dial-gradient)"
              strokeDasharray={`${(safe / 100) * circumference} ${circumference}`}
            />
          </svg>
          <strong>{formatScore(safe)}<small>/100</small></strong>
        </div>
      ) : null}
      <b className="abc-dial-city">{cityName}</b>
      <p className="abc-dial-headline">{headline}</p>
      {text ? <p className="abc-dial-text">{text}</p> : null}
    </aside>
  );
}

export function CityHero({
  crumbs,
  badge,
  title,
  lead,
  chips,
  primary,
  secondary,
  image,
  art,
  aside,
}: {
  crumbs: Crumb[];
  badge: string;
  title: string;
  lead: string;
  chips: string[];
  primary: CtaLink;
  secondary: CtaLink;
  image?: { src: string; alt: string } | null;
  art?: ReactNode;
  aside: ReactNode;
}) {
  return (
    <section className={`ab-hero ab-hero-shade abc-hero${art ? " abc-hero-art" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Stadtfoto aus dem CMS, bereits skaliert */}
      {image ? <img className="ab-hero-img" src={image.src} alt={image.alt} fetchPriority="high" decoding="async" /> : null}
      {art ? <div className="abc-hero-art-layer" aria-hidden="true">{art}</div> : null}
      <div className="ab-wrap abc-hero-grid">
        <div>
          <nav className="ab-crumbs" aria-label="Brotkrumen">
            {crumbs.map((crumb, index) => (
              <span key={crumb.label} style={{ display: "contents" }}>
                {index ? <span aria-hidden="true">›</span> : null}
                {crumb.href ? <LinkOrMarket link={{ label: crumb.label, href: crumb.href, previewHref: crumb.previewHref }}>{crumb.label}</LinkOrMarket> : <span aria-current="page">{crumb.label}</span>}
              </span>
            ))}
          </nav>
          <span className="ab-badge"><HeartIcon />{badge}</span>
          <h1>{title}</h1>
          <p className="ab-lead">{lead}</p>
          {chips.length ? <ul className="ab-chips">{chips.map((chip) => <li key={chip}>{chip}</li>)}</ul> : null}
          <div className="ab-actions">
            <a className="ab-btn ab-btn-primary" href={primary.href}>{primary.label}</a>
            <LinkOrMarket className="ab-btn ab-btn-ghost" link={secondary}>{secondary.label}</LinkOrMarket>
          </div>
        </div>
        {aside}
      </div>
    </section>
  );
}

export function FactStrip({ facts }: { facts: { icon: "spark" | "users" | "clock" | "heart" | "pin"; label: string; value: string }[] }) {
  const icons = { spark: SparkIcon, users: UsersIcon, clock: ClockIcon, heart: HeartIcon, pin: PinIcon } as const;
  return (
    <div className="ab-wrap">
      <ul className="ab-facts">
        {facts.slice(0, 4).map((fact) => {
          const Icon = icons[fact.icon];
          return <li key={fact.label}><Icon /><span><small>{fact.label}</small><strong>{fact.value}</strong></span></li>;
        })}
      </ul>
    </div>
  );
}

export function StatCardsSection({ cityName, cards, note }: { cityName: string; cards: StatCard[]; note?: string | null }) {
  if (!cards.length) return null;
  return (
    <section className="ab-wrap ab-section" aria-labelledby="abc-stats-title">
      <div className="ab-head">
        <p className="ab-eyebrow"><CompassIcon />Signal-Check</p>
        <h2 id="abc-stats-title">{cityName} in Zahlen</h2>
        <p>Diese Kennzahlen zeigen, wie gut {cityName} für neue Kontakte, entspannte erste Dates und passende Treffpunkte taugt.</p>
      </div>
      <div className="abc-stats">
        {cards.map((card, index) => (
          <article className="abc-stat" key={`${card.label}-${index}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            {card.description ? <p>{card.description}</p> : null}
          </article>
        ))}
      </div>
      {note ? <p className="abc-note">{note}</p> : null}
    </section>
  );
}

export function SignalSection({ cityName, strengths, weaknesses }: { cityName: string; strengths: Tip[]; weaknesses: Tip[] }) {
  if (!strengths.length && !weaknesses.length) return null;
  return (
    <section className="ab-wrap ab-section" aria-labelledby="abc-signal-title">
      <div className="ab-head">
        <p className="ab-eyebrow"><CheckIcon />Stärken &amp; Schwächen</p>
        <h2 id="abc-signal-title">Was in {cityName} für Dates spricht – und was du im Blick behalten solltest</h2>
      </div>
      <div className="abc-signal">
        {strengths.length ? (
          <article className="abc-signal-card abc-signal-plus">
            <span className="abc-signal-kicker">Das hilft dir in {cityName}</span>
            <ul>
              {strengths.map((tip, index) => (
                <li key={`plus-${index}`}><span className="abc-signal-mark" aria-hidden="true">+</span><div>{tip.title ? <strong>{tip.title}</strong> : null}{tip.text ? <p>{tip.text}</p> : null}</div></li>
              ))}
            </ul>
          </article>
        ) : null}
        {weaknesses.length ? (
          <article className="abc-signal-card abc-signal-minus">
            <span className="abc-signal-kicker">Darauf solltest du achten</span>
            <ul>
              {weaknesses.map((tip, index) => (
                <li key={`minus-${index}`}><span className="abc-signal-mark" aria-hidden="true">!</span><div>{tip.title ? <strong>{tip.title}</strong> : null}{tip.text ? <p>{tip.text}</p> : null}</div></li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </section>
  );
}

export function PlacesSection({ cityName, places, eyebrow, title, intro }: { cityName: string; places: Place[]; eyebrow?: string | null; title?: string | null; intro?: string | null }) {
  if (!places.length) return null;
  return (
    <section className="ab-wrap ab-section" aria-labelledby="abc-places-title">
      <div className="ab-head">
        <p className="ab-eyebrow"><PinIcon />{eyebrow || `Date-Ideen in ${cityName}`}</p>
        <h2 id="abc-places-title">{title || `${places.length} konkrete Orte für Dates in ${cityName}`}</h2>
        <p>{intro || `Treffpunkte, die sich für ein erstes Kennenlernen oder einen entspannten nächsten Schritt in ${cityName} eignen.`}</p>
      </div>
      <div className="abc-places">
        {places.map((place, index) => {
          const mapsUrl = place.mapsUrl || (place.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}` : null);
          return (
            <article className="abc-place" key={`${place.name}-${index}`} style={{ ["--tilt" as string]: `${index % 2 ? 0.8 : -0.8}deg` }}>
              <div className="abc-place-top">
                <span className="abc-place-type"><PinIcon />{place.typeLabel}</span>
                {place.category ? <span className="abc-place-cat">{place.category}</span> : null}
              </div>
              <h3>{place.name}</h3>
              {place.tip ? <p>{place.tip}</p> : null}
              {place.address || place.openingHours ? (
                <dl>
                  {place.address ? <div><dt>Adresse</dt><dd>{place.address}</dd></div> : null}
                  {place.openingHours ? <div><dt>Öffnungszeiten</dt><dd>{place.openingHours}</dd></div> : null}
                </dl>
              ) : null}
              {mapsUrl ? <a className="abc-place-map" href={mapsUrl} rel="nofollow noopener noreferrer" target="_blank">Karte öffnen <ArrowIcon /></a> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function TipsSection({ cityName, tips, eyebrow, title, intro }: { cityName: string; tips: Tip[]; eyebrow?: string | null; title?: string | null; intro?: string | null }) {
  if (!tips.length) return null;
  return (
    <section className="ab-wrap ab-section" aria-labelledby="abc-tips-title">
      <div className="ab-head">
        <p className="ab-eyebrow"><SparkIcon />{eyebrow || "Dating-Ideen"}</p>
        <h2 id="abc-tips-title">{title || `Konkrete Dating-Ideen für ${cityName}`}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      <div className="abc-tips">
        {tips.map((tip, index) => (
          <article className="abc-tip" key={`tip-${index}`}>
            <span className="abc-tip-no" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            {tip.title ? <strong>{tip.title}</strong> : null}
            {tip.text ? <p>{tip.text}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

/** Stadtporträt: Inhaltsverzeichnis links, Text rechts. */
export function GuideSection({ cityName, toc, sidebar, children }: { cityName: string; toc: TocItem[]; sidebar?: ReactNode; children: ReactNode }) {
  return (
    <section id="stadtportraet" className="ab-wrap ab-section abc-guide" aria-label={`Stadtporträt ${cityName}`}>
      <aside className="abc-guide-side">
        {toc.length ? (
          <nav className="abc-toc" aria-label="Inhaltsverzeichnis">
            <span className="abc-toc-kicker"><BookIcon />Stadtporträt</span>
            <strong>Dating ab 50 in {cityName}</strong>
            <ol>{toc.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
          </nav>
        ) : null}
        {sidebar}
      </aside>
      <div className="abc-guide-main">{children}</div>
    </section>
  );
}

export function AuthorBox({ name, role, imageSrc, href, text, tags }: { name: string; role: string; imageSrc: string; href: string; text: string; tags?: string[] }) {
  return (
    <section className="abc-author" aria-label="Wer diese Inhalte schreibt">
      {/* eslint-disable-next-line @next/next/no-img-element -- Autorenfoto aus WordPress */}
      <img src={imageSrc} alt={name} width={96} height={118} loading="lazy" decoding="async" />
      <div>
        <p className="ab-eyebrow">Von {name}</p>
        <strong>{role}</strong>
        <p>{text}</p>
        {tags?.length ? <div className="abc-author-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
        <a className="abc-author-link" href={href}>Mehr von Christian lesen <ArrowIcon /></a>
      </div>
    </section>
  );
}

export function CtaBand({ eyebrow, title, text, primary, secondary }: { eyebrow: string; title: string; text: string; primary: CtaLink; secondary: CtaLink }) {
  return (
    <section className="ab-wrap ab-section">
      <div className="ab-band">
        <div>
          <p className="ab-eyebrow"><HeartIcon />{eyebrow}</p>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="ab-band-actions">
          <a className="ab-btn ab-btn-primary" href={primary.href}>{primary.label}</a>
          <LinkOrMarket className="ab-btn ab-btn-ghost" link={secondary}>{secondary.label}</LinkOrMarket>
        </div>
      </div>
    </section>
  );
}
