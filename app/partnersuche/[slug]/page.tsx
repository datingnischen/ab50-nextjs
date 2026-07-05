import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { cityPath, getAllCities, getAllPublicCitySlugs, getCityByPublicSlug, normalizeCitySlug, stripHtml, type WpCityStatCard, type WpCityTip, type WpLocalPlace, type WpSourceItem } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { formatGermanDate } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type TocItem = { id: string; label: string };

type SplitCityTips = {
  strengths: WpCityTip[];
  weaknesses: WpCityTip[];
  generalTips: WpCityTip[];
};

type ParsedPlace = {
  name: string;
  typeLabel: string;
  category?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  mapsUrl?: string | null;
  openingHours?: string | null;
  tip?: string | null;
  dataSource?: string | null;
};

const placeTypeLabels: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  park: "Park",
  library: "Bibliothek",
  university: "Universität",
  other: "Ort",
};

const cityAuthor = {
  name: "Christian M. Haas",
  role: "Autor & Dating-Experte bei ab50.de",
  imageSrc: "https://ab50.de/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png",
  imageAlt: "Christian M. Haas",
  href: "/magazin/christian-m-haas",
};

function sanitizeTitle(value?: string | null) {
  return stripHtml(value || "");
}

function slugifyHeading(value: string) {
  return value
    .replace(/&amp;/g, "und")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "abschnitt";
}

function extractTocItems(html?: string | null): TocItem[] {
  const source = html || "";
  const seen = new Map<string, number>();
  return Array.from(source.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
    .map((match) => stripHtml(match[1]).replace(/&amp;/g, "&"))
    .filter(Boolean)
    .slice(0, 8)
    .map((label) => {
      const base = slugifyHeading(label);
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return { label, id: count ? `${base}-${count + 1}` : base };
    });
}

function addHeadingIds(html: string, tocItems: TocItem[]) {
  let index = 0;
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, inner) => {
    const id = tocItems[index]?.id;
    index += 1;
    if (!id || /\sid=/.test(attrs)) return match;
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
}

function linesFromTextarea(value?: string | null) {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function cityRegistrationLink() {
  return siteConfig.links.registrationLocation || siteConfig.links.registrationCommon;
}

function inlineCityCta(cityName: string) {
  return `
    <aside class="article-inline-cta" aria-label="ab50 Registrierung">
      <p class="eyebrow">Direkt weitermachen</p>
      <h2>Wenn du magst, kannst du jetzt neue Kontakte in ${cityName} entdecken.</h2>
      <p>Starte kostenlos auf ab50.de und schau dich in Ruhe nach passenden Begegnungen in deiner Region um.</p>
      <a class="button-primary" href="${cityRegistrationLink()}">Kostenlos starten</a>
    </aside>
  `;
}

function injectInlineCta(html: string, cityName: string) {
  let headingCount = 0;
  return html.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi, (match) => {
    headingCount += 1;
    if (headingCount === 2) return `${match}${inlineCityCta(cityName)}`;
    return match;
  });
}

function sanitizeContent(html?: string | null, tocItems: TocItem[] = [], cityName = "deiner Stadt") {
  const cleaned = (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\sdata-srcset=/gi, " srcset=")
    .replace(/\sdata-src=/gi, " src=")
    .replace(/class=("|')([^"']*?)lazyload([^"']*?)(\1)/gi, 'class="$2$3"')
    .replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy"')
    .replace(/<img(?![^>]*decoding=)/gi, '<img decoding="async"');

  return injectInlineCta(addHeadingIds(cleaned, tocItems), cityName);
}

function buildPublicSlugMap(citySlugs: string[]) {
  return new Map(citySlugs.map((slug) => [normalizeCitySlug(slug), slug]));
}

function cityLead(city: Awaited<ReturnType<typeof getCityByPublicSlug>>) {
  if (!city) return "";
  return city.acf?.hero_lead || city.acf?.city_hero_claim || city.acf?.city_dating_angle || stripHtml(city.content).slice(0, 220);
}

function estimateReadingTime(html?: string | null) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => (value || "").trim()).filter(Boolean)));
}

function splitCityTips(tips?: WpCityTip[] | null): SplitCityTips {
  const strengths: WpCityTip[] = [];
  const weaknesses: WpCityTip[] = [];
  const generalTips: WpCityTip[] = [];

  for (const tip of tips || []) {
    const rawTitle = (tip?.title || "").trim();
    const text = (tip?.text || "").trim();
    if (!rawTitle && !text) continue;

    const lowered = rawTitle.toLowerCase();
    const cleanTitle = rawTitle.replace(/^(stärke|staerke|plus|vorteil|schwäche|schwaeche|minus|limit):\s*/i, "").trim();
    const normalizedTip = { ...tip, title: cleanTitle || rawTitle, text };

    if (/^(stärke|staerke|plus|vorteil):/i.test(lowered)) {
      strengths.push(normalizedTip);
    } else if (/^(schwäche|schwaeche|minus|limit):/i.test(lowered)) {
      weaknesses.push(normalizedTip);
    } else {
      generalTips.push(normalizedTip);
    }
  }

  return { strengths, weaknesses, generalTips };
}

function placeTypeLabel(type?: string | null) {
  const key = (type || "other").toLowerCase();
  return placeTypeLabels[key] || type || "Ort";
}

function normalizePlaces(places?: WpLocalPlace[] | null): ParsedPlace[] {
  return (places || [])
    .map((place) => {
      const name = (place.place_name || "").trim();
      const address = (place.place_address || "").trim();
      if (!name && !address) return null;
      return {
        name: name || "Lokaler Ort",
        typeLabel: placeTypeLabel(place.place_type),
        category: place.place_category || null,
        address: address || null,
        phone: place.place_phone || null,
        website: place.place_website || null,
        mapsUrl: place.place_maps_url || null,
        openingHours: place.place_opening_hours || null,
        tip: place.place_tip_text || null,
        dataSource: place.place_data_source || null,
      } as ParsedPlace;
    })
    .filter((place): place is ParsedPlace => Boolean(place));
}

function PlaceCardsSection({
  cityName,
  eyebrow,
  title,
  intro,
  places,
}: {
  cityName: string;
  eyebrow?: string | null;
  title?: string | null;
  intro?: string | null;
  places: ParsedPlace[];
}) {
  if (!places.length) return null;

  return (
    <section className="city-places-section" aria-label={`Date-Orte in ${cityName}`}>
      <div className="section-heading compact-heading place-section-heading">
        <p className="eyebrow">{eyebrow || `Date-Ideen in ${cityName}`}</p>
        <h2>{title || `${places.length} konkrete Orte für Dates in ${cityName}`}</h2>
        <p>{intro || `Hier findest du konkrete Treffpunkte, die sich für ein erstes Kennenlernen oder einen entspannten nächsten Schritt in ${cityName} eignen.`}</p>
      </div>
      <div className="place-card-grid">
        {places.map((place, index) => {
          const mapsUrl = place.mapsUrl || (place.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}` : null);
          return (
            <article className="place-card" key={`${place.name}-${index}`}>
              <div className="place-card-topline">
                <span className="place-type-badge">📍 {place.typeLabel}</span>
                {place.category ? <span className="place-category-badge">{place.category}</span> : null}
              </div>
              <h3>{place.name}</h3>
              {place.tip ? <p className="place-card-text">{place.tip}</p> : null}
              <dl className="place-meta-list">
                {place.address ? (
                  <div>
                    <dt>Adresse</dt>
                    <dd>{place.address}</dd>
                  </div>
                ) : null}
                {place.phone ? (
                  <div>
                    <dt>Telefon</dt>
                    <dd><a href={`tel:${place.phone.replace(/\s+/g, "")}`}>{place.phone}</a></dd>
                  </div>
                ) : null}
                {place.openingHours ? (
                  <div>
                    <dt>Öffnungszeiten</dt>
                    <dd>{place.openingHours}</dd>
                  </div>
                ) : null}
                {place.dataSource ? (
                  <div>
                    <dt>Datenbasis</dt>
                    <dd>{place.dataSource}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="place-actions">
                {place.website ? <a href={place.website} rel="nofollow noopener noreferrer" target="_blank">Website</a> : null}
                {mapsUrl ? <a href={mapsUrl} rel="nofollow noopener noreferrer" target="_blank">Karte öffnen</a> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function normalizeStatCards(cards?: WpCityStatCard[] | null) {
  return (cards || []).filter((card) => (card?.label || card?.value || card?.description));
}

function normalizeScore(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(",", "."));
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeSources(sources?: WpSourceItem[] | null) {
  return (sources || []).filter((source) => source?.title || source?.url || source?.publisher || source?.note);
}

export async function generateStaticParams() {
  const slugs: string[] = await getAllPublicCitySlugs();
  return slugs.map((citySlug) => ({ slug: citySlug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityByPublicSlug(slug);
  if (!city) return {};
  const cityName = city.acf?.city_name || sanitizeTitle(city.title);
  const title = city.acf?.hero_title || sanitizeTitle(city.title);
  const description = cityLead(city) || `Singles in ${cityName} kennenlernen: regionale Dating-Tipps, lokale Orientierung und ein kostenloser Einstieg für neue Kontakte ab 50.`;

  return {
    title,
    description,
    alternates: { canonical: cityPath(slug) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(cityPath(slug)),
      type: "article",
      locale: "de_DE",
      siteName: siteConfig.name,
      images: city.featuredImage?.sourceUrl ? [{ url: city.featuredImage.sourceUrl, alt: city.featuredImage.altText || title }] : undefined,
    },
  };
}

function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <nav className="article-toc city-sidebar-card" aria-label="Inhaltsverzeichnis">
      <p className="eyebrow">Auf dieser Seite</p>
      <strong>Deine Schnellnavigation</strong>
      <ol>
        {items.map((item: TocItem) => (
          <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
        ))}
      </ol>
    </nav>
  );
}

function SourceBox({
  sources,
  intro,
  reviewedAt,
  reviewNote,
  displayMode,
}: {
  sources: WpSourceItem[];
  intro?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  displayMode?: string | null;
}) {
  if (displayMode === "hidden" || (!sources.length && !reviewedAt && !reviewNote)) return null;

  return (
    <section className={`city-source-box city-source-box-${displayMode || "auto"}`} aria-label="Quellen und Aktualität">
      <p className="eyebrow">Quellen, Bilder & Aktualität</p>
      {intro ? <p>{intro}</p> : <p>Diese Seite wird redaktionell gepflegt. Die folgenden Quellen stützen Stadtprofil, Zahlen und lokale Einordnung.</p>}
      {reviewedAt || reviewNote ? (
        <div className="city-source-review-note">
          {reviewedAt ? <strong>Geprüft am {reviewedAt}</strong> : null}
          {reviewNote ? <span>{reviewNote}</span> : null}
        </div>
      ) : null}
      {sources.length ? (
        <ul className="city-source-list">
          {sources.map((source, index) => (
            <li key={`${source.title || source.url || "source"}-${index}`}>
              {source.url ? <a href={source.url} rel="nofollow noopener noreferrer" target="_blank">{source.title || source.url}</a> : <strong>{source.title || source.publisher || "Quelle"}</strong>}
              {[source.publisher, source.date].filter(Boolean).length ? <span>{[source.publisher, source.date].filter(Boolean).join(" · ")}</span> : null}
              {source.note ? <em>{source.note}</em> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function FlirtFactorVisualCard({ cityName, score, text }: { cityName: string; score: number | null; text?: string | null }) {
  if (score === null && !text) return null;
  const safeScore = score === null ? null : Math.max(0, Math.min(100, score));
  return (
    <div className="flirt-factor-card" aria-label={`Flirt-Faktor ${cityName}`}>
      <div>
        <span className="flirt-factor-kicker">Stadtprofil</span>
        <strong>{safeScore !== null ? `${safeScore.toLocaleString("de-DE", { minimumFractionDigits: safeScore % 1 ? 1 : 0, maximumFractionDigits: 1 })}/100` : `Dating ab 50 in ${cityName}`}</strong>
        <p>{text || `Ein ruhiger Überblick darüber, wie gut ${cityName} für neue Kontakte, passende Orte und einen entspannten Start geeignet ist.`}</p>
      </div>
      {safeScore !== null ? (
        <div className="flirt-meter" aria-hidden="true">
          <span style={{ width: `${safeScore}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function CityHeroVisual({
  cityName,
  title,
  image,
  profileEyebrow,
  profileTitle,
  profileText,
  score,
  scoreText,
}: {
  cityName: string;
  title: string;
  image?: { sourceUrl?: string | null; altText?: string | null; width?: number | null; height?: number | null } | null;
  profileEyebrow?: string | null;
  profileTitle?: string | null;
  profileText?: string | null;
  score: number | null;
  scoreText?: string | null;
}) {
  return (
    <div className="city-visual-wrap">
      <div className="city-phone-card">
        <div className="city-phone-topbar">
          <span />
          <strong>ab50.de</strong>
          <em>{cityName}</em>
        </div>
        {image?.sourceUrl ? (
          <Image
            priority
            sizes="(max-width: 980px) 100vw, 420px"
            src={image.sourceUrl}
            alt={image.altText || title}
            width={image.width || 1200}
            height={image.height || 800}
            className="city-phone-image"
          />
        ) : (
          <div className="city-phone-placeholder" />
        )}
        <div className="city-profile-card">
          <span>{profileEyebrow || "Dein Einstieg"}</span>
          <strong>{profileTitle || `Neue Kontakte in ${cityName}`}</strong>
          <p>{profileText || `Regionale Orientierung, konkrete Dating-Ideen und ein ruhiger Einstieg für Singles ab 50.`}</p>
        </div>
      </div>
      <FlirtFactorVisualCard cityName={cityName} score={score} text={scoreText} />
    </div>
  );
}

function CityStatsModule({
  cityName,
  statCards,
  quickFacts,
}: {
  cityName: string;
  statCards: WpCityStatCard[];
  quickFacts: Array<{ label: string; value: string }>;
}) {
  const cards = statCards.length
    ? statCards.slice(0, 3).map((card) => ({
        label: card.label || "Signal",
        value: card.value || cityName,
        description: card.description || `Hilft dir, ${cityName} schneller für deine Partnersuche ab 50 einzuordnen.`,
      }))
    : quickFacts.map((fact) => ({
        label: fact.label,
        value: fact.value,
        description: `Ein schneller Überblick für ${cityName}.`,
      }));

  return (
    <section className="city-stats-grid" aria-label={`Stadtfakten für ${cityName}`}>
      {cards.map((card, index) => (
        <article className="city-stat-card" key={`${card.label}-${index}`}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <p>{card.description}</p>
        </article>
      ))}
    </section>
  );
}

function CityCtaBox({
  eyebrow,
  title,
  text,
  note,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  text: string;
  note?: string | null;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <section className="city-cta-box city-cta-box-compact" aria-label="Nächster Schritt">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="city-cta-actions">
        <a className="button-primary" href={primaryHref}>{primaryLabel}</a>
        <a className="button-secondary" href={secondaryHref}>{secondaryLabel}</a>
      </div>
      {note ? <small>{note}</small> : null}
    </section>
  );
}

export default async function PartnersucheCityPage({ params }: PageProps) {
  const { slug } = await params;
  const [city, allCities, publicCitySlugs] = await Promise.all([
    getCityByPublicSlug(slug),
    getAllCities(),
    getAllPublicCitySlugs(),
  ]);

  if (!city) notFound();

  const title = city.acf?.hero_title || sanitizeTitle(city.title);
  const cityName = city.acf?.city_name || title;
  const lead = cityLead(city) || `Hier bekommst du einen ruhigen regionalen Einstieg in das Thema Dating ab 50 in ${cityName}.`;
  const publicSlugMap = buildPublicSlugMap(publicCitySlugs);
  const relatedCities = allCities.filter((item: typeof allCities[number]) => item.slug !== city.slug).slice(0, 6);
  const readingMinutes = estimateReadingTime(city.content);
  const tocItems = extractTocItems(city.content);
  const safeHtml = sanitizeContent(city.content, tocItems, cityName);
  const lastUpdated = city.modified ? formatGermanDate(city.modified) : null;
  const reviewDate = city.acf?.content_reviewed_at ? formatGermanDate(city.acf.content_reviewed_at) : null;
  const sourceIntro = city.acf?.sources_intro || null;
  const sourceDisplayMode = city.acf?.sources_display_mode || "auto";
  const sources = normalizeSources(city.acf?.sources);
  const heroChips = linesFromTextarea(city.acf?.city_hero_chips);
  const trustPoints = linesFromTextarea(city.acf?.city_trust_points);
  const score = normalizeScore(city.acf?.flirt_factor_score);
  const statCards = normalizeStatCards(city.acf?.local_stat_cards);
  const splitTips = splitCityTips(city.acf?.local_tips);
  const places = normalizePlaces(city.acf?.local_places);
  const hasEnhancedSignals = Boolean(score || statCards.length || splitTips.strengths.length || splitTips.weaknesses.length || splitTips.generalTips.length || places.length);
  const primaryCtaHref = city.acf?.primary_cta_url || cityRegistrationLink();
  const primaryCtaLabel = city.acf?.primary_cta_label || "Kostenlos starten";
  const secondaryCtaHref = city.acf?.secondary_cta_url || "/partnersuche";
  const secondaryCtaLabel = city.acf?.secondary_cta_label || "Alle Städte";
  const sidebarCtaHref = city.acf?.city_sidebar_cta_url || primaryCtaHref;
  const sidebarCtaLabel = city.acf?.city_sidebar_cta_label || primaryCtaLabel;
  const finalCtaEyebrow = city.acf?.city_cta_eyebrow || "Nächster Schritt";
  const finalCtaTitle = city.acf?.city_cta_title || `Wenn du magst, kannst du jetzt direkt kostenlos starten und neue Kontakte in ${cityName} entdecken.`;
  const finalCtaText = city.acf?.city_cta_text || "Oder du schaust dir weitere Städte und Magazin-Themen in Ruhe an.";
  const finalCtaNote = city.acf?.city_cta_note || null;
  const citySignals = uniqueNonEmpty([
    city.acf?.city_hero_claim,
    city.acf?.city_dating_angle,
    ...trustPoints,
    `Singles ab 50 in ${cityName}`,
  ]).slice(0, 4);
  const heroChipItems = heroChips.length ? heroChips : ["Singles ab 50", "Regionale Orientierung", "Kostenlos starten"];
  const quickFacts = [
    { label: "Fokus", value: `Partnersuche ab 50 in ${cityName}` },
    { label: "Lesezeit", value: `${readingMinutes} Min.` },
    { label: "Aktualisiert", value: lastUpdated || "laufend gepflegt" },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    headline: title,
    description: lead,
    url: absoluteUrl(cityPath(slug)),
    inLanguage: "de-DE",
    about: `Dating ab 50 in ${cityName}`,
    image: city.featuredImage?.sourceUrl,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    author: {
      "@type": "Person",
      name: cityAuthor.name,
      url: absoluteUrl(cityAuthor.href),
      image: cityAuthor.imageSrc,
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Partnersuche",
        item: absoluteUrl("/partnersuche"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: cityName,
        item: absoluteUrl(cityPath(slug)),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <article className="container article-page city-page city-page-premium">
        <div className="category-hero-card city-overview-hero city-detail-hero city-premium-hero">
          <div className="category-hero-copy">
            <nav className="article-breadcrumbs" aria-label="Breadcrumb">
              <a href="/partnersuche">Partnersuche</a>
              <span aria-hidden="true">/</span>
              <span>{cityName}</span>
            </nav>
            <p className="eyebrow">{city.acf?.hero_eyebrow || `Partnersuche ab 50 in ${cityName}`}</p>
            <h1>{title}</h1>
            <p className="lead">{lead}</p>
            <div className="trust-chip-row" aria-label="Stadtvorteile">
              {heroChipItems.map((chip) => <span key={chip}>{chip}</span>)}
            </div>
            <div className="hero-actions">
              <a className="button-primary" href={primaryCtaHref}>{primaryCtaLabel}</a>
              <a className="button-secondary" href={secondaryCtaHref}>{secondaryCtaLabel}</a>
            </div>
          </div>
          <aside className="category-hero-sidecard city-hero-sidecard city-hero-visual-shell" aria-label="Schneller Überblick">
            <CityHeroVisual
              cityName={cityName}
              title={title}
              image={city.featuredImage}
              profileEyebrow={city.acf?.city_profile_card_eyebrow}
              profileTitle={city.acf?.city_profile_card_title}
              profileText={city.acf?.city_profile_card_text}
              score={score}
              scoreText={city.acf?.flirt_factor_text || city.acf?.city_dating_angle}
            />
          </aside>
        </div>

        <section className="overview-intent-grid city-intro-grid" aria-label="Schnelleinstieg">
          <article className="overview-intent-card overview-intent-card-guide city-intro-card">
            <span>{city.acf?.city_highlight_eyebrow || "Regionaler Einstieg"}</span>
            <strong>{city.acf?.city_highlight_title || `Dating ab 50 in ${cityName} verständlich einordnen`}</strong>
            <p>{city.acf?.city_highlight_text || `Die Seite bündelt regionale Hinweise, typische Fragen und einen ruhigen Einstieg für Menschen, die in ${cityName} neue Kontakte suchen.`}</p>
          </article>
          <article className="overview-intent-card overview-intent-card-trust city-intro-card">
            <span>Was du mitnimmst</span>
            <strong>{tocItems.length ? `${tocItems.length} klare Themenblöcke statt Textwüste` : `Kompakte Orientierung statt unnötiger Umwege`}</strong>
            <p>So kommst du schneller zu den Abschnitten, die gerade wirklich zu deiner Situation und deinem Tempo passen.</p>
          </article>
          <article className="overview-intent-card overview-intent-card-featured city-intro-card">
            <span>Nächster Schritt</span>
            <strong>Danach kannst du direkt kostenlos weitermachen</strong>
            <p>Wenn du nicht nur lesen, sondern wirklich neue Begegnungen in {cityName} entdecken möchtest, ist der Einstieg auf ab50.de sofort greifbar.</p>
          </article>
        </section>

        <div className="city-top-modules">
          <CityStatsModule cityName={cityName} statCards={statCards} quickFacts={quickFacts} />
          <CityCtaBox
            eyebrow={city.acf?.city_sidebar_eyebrow || finalCtaEyebrow}
            title={city.acf?.city_sidebar_title || city.acf?.city_cta_title || `Starte kostenlos und entdecke neue Kontakte in ${cityName}.`}
            text={city.acf?.city_sidebar_text || city.acf?.city_cta_text || `Wenn du nach dem Lesen direkt weitermachen willst, kannst du dich ohne Umwege in deiner Region umschauen.`}
            note={city.acf?.city_cta_note || finalCtaNote}
            primaryHref={primaryCtaHref}
            primaryLabel={primaryCtaLabel}
            secondaryHref={secondaryCtaHref}
            secondaryLabel={secondaryCtaLabel}
          />
        </div>

        <section className="article-body-grid city-body-grid">
          <aside className="article-side-column city-side-column">
            <div className="city-sidebar-stack">
              <TableOfContents items={tocItems} />
              <section className="city-sidebar-card city-sidebar-soft" aria-label="Kurz zusammengefasst">
                <p className="eyebrow">{city.acf?.city_trust_eyebrow || "Kurz gesagt"}</p>
                <strong>Darum lohnt sich die Seite für {cityName}</strong>
                <ul className="city-key-points">
                  {citySignals.map((point) => <li key={point}>{point}</li>)}
                  <li>Direkte Wege zu weiteren regionalen Einstiegen und zum Magazin</li>
                </ul>
              </section>
              <section className="city-sidebar-card city-sidebar-cta" aria-label="Kostenlos starten">
                <p className="eyebrow">{city.acf?.city_sidebar_eyebrow || "Bereit für den nächsten Schritt?"}</p>
                <strong>{city.acf?.city_sidebar_title || "Starte kostenlos und schau dich in deiner Region um."}</strong>
                <p>{city.acf?.city_sidebar_text || "Ohne Druck, aber mit einem klaren nächsten Schritt für neue Kontakte ab 50."}</p>
                <a className="button-primary" href={sidebarCtaHref}>{sidebarCtaLabel}</a>
              </section>
            </div>
          </aside>

          <div className="article-main-column">
            <section className="article-takeaway-box city-takeaway-box" aria-label="Stadtprofil">
              <p className="eyebrow">Stadtprofil</p>
              <h2>Das Wichtigste für Dating ab 50 in {cityName}</h2>
              <p>{lead}</p>
              <div className="city-meta-grid">
                {quickFacts.map((fact) => (
                  <div className="city-meta-card" key={fact.label}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            {hasEnhancedSignals ? (
              <section className="city-score-section" aria-label={`Dating-Signale für ${cityName}`}>
                <div className="section-heading compact-heading">
                  <p className="eyebrow">Signal-Check</p>
                  <h2>Wie stark {cityName} für neue Begegnungen aufgestellt ist</h2>
                  <p>{city.acf?.flirt_factor_text || city.acf?.city_dating_angle || `Diese Signale helfen dir, ${cityName} als Dating-Stadt besser einzuordnen.`}</p>
                </div>
                <div className="city-score-grid">
                  {score !== null ? (
                    <article className="city-score-card city-score-card-primary">
                      <span>Flirt-Faktor</span>
                      <strong>{score.toLocaleString("de-DE", { minimumFractionDigits: score % 1 ? 1 : 0, maximumFractionDigits: 1 })}/100</strong>
                      <p>{city.acf?.flirt_factor_text || `Ein redaktioneller Blick darauf, wie kontaktfreundlich ${cityName} für erste Dates wirkt.`}</p>
                    </article>
                  ) : null}
                  {statCards.map((card, index) => (
                    <article className="city-score-card" key={`${card.label || "card"}-${index}`}>
                      <span>{card.label || "Signal"}</span>
                      <strong>{card.value}</strong>
                      {card.description ? <p>{card.description}</p> : null}
                    </article>
                  ))}
                </div>
                {reviewDate || city.acf?.content_review_note ? (
                  <p className="city-data-note">{reviewDate ? `Datenstand geprüft am ${reviewDate}. ` : ""}{city.acf?.content_review_note || ""}</p>
                ) : null}
              </section>
            ) : null}

            {(splitTips.strengths.length || splitTips.weaknesses.length) ? (
              <section className="city-signal-section" aria-label={`Stärken und Schwächen für ${cityName}`}>
                <div className="section-heading compact-heading">
                  <p className="eyebrow">Stärken & Schwächen</p>
                  <h2>Was in {cityName} für Dates spricht – und was du im Blick behalten solltest</h2>
                </div>
                <div className="city-signal-grid">
                  {splitTips.strengths.length ? (
                    <article className="city-signal-card city-signal-card-positive">
                      <span>Stärken</span>
                      <strong>Das hilft dir in {cityName}</strong>
                      <ul>
                        {splitTips.strengths.map((tip, index) => (
                          <li key={`strength-${index}`}>
                            <strong>{tip.title}</strong>
                            {tip.text ? <p>{tip.text}</p> : null}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ) : null}
                  {splitTips.weaknesses.length ? (
                    <article className="city-signal-card city-signal-card-neutral">
                      <span>Worauf du achten solltest</span>
                      <strong>Diese Punkte sind in {cityName} wichtig</strong>
                      <ul>
                        {splitTips.weaknesses.map((tip, index) => (
                          <li key={`weakness-${index}`}>
                            <strong>{tip.title}</strong>
                            {tip.text ? <p>{tip.text}</p> : null}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ) : null}
                </div>
              </section>
            ) : null}

            <PlaceCardsSection
              cityName={cityName}
              eyebrow={city.acf?.local_places_eyebrow}
              title={city.acf?.local_places_title}
              intro={city.acf?.local_places_intro}
              places={places}
            />

            {splitTips.generalTips.length ? (
              <section className="city-tip-section" aria-label={`Dating-Ideen für ${cityName}`}>
                <div className="section-heading compact-heading">
                  <p className="eyebrow">{city.acf?.local_tips_eyebrow || "Dating-Ideen"}</p>
                  <h2>{city.acf?.local_tips_title || `Konkrete Dating-Ideen für ${cityName}`}</h2>
                  {city.acf?.local_tips_intro ? <p>{city.acf.local_tips_intro}</p> : null}
                </div>
                <div className="city-tip-grid">
                  {splitTips.generalTips.map((tip, index) => (
                    <article className="city-tip-card" key={`tip-${index}`}>
                      {tip.title ? <strong>{tip.title}</strong> : null}
                      {tip.text ? <p>{tip.text}</p> : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="article-content-card">
              <div className="article-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />
            </div>

            <SourceBox
              sources={sources}
              intro={sourceIntro}
              reviewedAt={reviewDate}
              reviewNote={city.acf?.content_review_note}
              displayMode={sourceDisplayMode}
            />

            <section className="magazine-author-box city-author-box" aria-label="Autor und Einordnung">
              <div className="magazine-author-avatar" aria-hidden="true">
                <Image
                  src={cityAuthor.imageSrc}
                  alt={cityAuthor.imageAlt}
                  width={96}
                  height={96}
                />
              </div>
              <div>
                <p className="eyebrow">Eingeordnet von</p>
                <h2>{cityAuthor.name}</h2>
                <p className="magazine-author-role">{cityAuthor.role}</p>
                <p>Diese Stadtseite wird für Menschen aufbereitet, die Dating ab 50 regional, respektvoll und ohne hektisches Gefühl angehen möchten. Deshalb findest du hier keine technische Spielerei, sondern einen klaren lokalen Einstieg.</p>
                <div className="magazine-author-meta">
                  <span>Regionale Partnersuche</span>
                  <span>Dating ab 50</span>
                  {lastUpdated ? <span>Zuletzt aktualisiert am {lastUpdated}</span> : null}
                </div>
                <a className="button-secondary magazine-author-link" href={cityAuthor.href}>Zum Autorenprofil</a>
              </div>
            </section>
          </div>
        </section>

        {relatedCities.length ? (
          <div className="category-topic-strip city-related-strip" aria-label="Weitere Städte">
            <div className="section-heading compact-heading">
              <p className="eyebrow">Weitere Städte</p>
              <h2>Weitere regionale Einstiege</h2>
            </div>
            <div className="category-topic-grid">
              {relatedCities.map((item: typeof relatedCities[number]) => {
                const publicSlug = publicSlugMap.get(item.slug) || item.slug;
                return (
                  <a className="category-topic-card" href={cityPath(publicSlug)} key={item.slug}>
                    <span>{item.acf?.city_name || sanitizeTitle(item.title)}</span>
                    <strong>{item.acf?.city_hero_claim || item.acf?.city_dating_angle || `Mehr Orientierung und regionale Dating-Inhalte für ${item.acf?.city_name || sanitizeTitle(item.title)}.`}</strong>
                    <em className="card-read-more">Stadtseite öffnen</em>
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}

        <section className="overview-cta-strip category-final-cta" aria-label="Nächster Schritt">
          <div>
            <p className="eyebrow">{finalCtaEyebrow}</p>
            <h2>{finalCtaTitle}</h2>
            <p>{finalCtaText}</p>
            {finalCtaNote ? <small className="city-cta-note">{finalCtaNote}</small> : null}
          </div>
          <div className="overview-cta-actions">
            <a className="button-primary" href={primaryCtaHref}>{primaryCtaLabel}</a>
            <a className="button-secondary" href="/magazin">Zum Magazin</a>
          </div>
        </section>
      </article>
    </>
  );
}
