import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { withSlashedPageLinks } from "@/lib/markets";
import { cityPath, getAllCities, getAllPublicCitySlugs, getCityByPublicSlug, normalizeCitySlug, stripHtml, type WpCityStatCard, type WpCityTip, type WpLocalPlace, type WpSourceItem } from "@/lib/wordpress";
import { CityFurtherCities } from "@/components/city-further-cities";
import { IconyIframeSinglesWidget } from "@/components/icony-iframe-singles-widget";
import { pickFurtherCities } from "@/lib/further-cities";
import { getIconyWidgetLocationForRoute } from "@/data/city-widget-locations";
import { citySearchUrl } from "@/lib/city-search";
import { siteConfig } from "@/data/site";
import { staticAsset } from "@/lib/static-asset";
import { marketPartnersuchePath } from "@/lib/markets";
import { AuthorBox, CityHero, CtaBand, FactStrip, FlirtDial, GuideSection, PlacesSection, SignalSection, StatCardsSection, TipsSection } from "@/components/ab-city/city-parts";

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
  mapsUrl?: string | null;
  openingHours?: string | null;
  tip?: string | null;
};

const placeTypeLabels: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  bar: "Bar",
  park: "Park",
  library: "Bibliothek",
  museum: "Museum",
  zoo: "Zoo",
  theater: "Theater",
  university: "Universität",
  other: "Ort",
};

const cityAuthor = {
  name: "Christian M. Haas",
  role: "Autor & Dating-Experte bei ab50.de",
  imageSrc: "https://ab50.de/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png",
  imageAlt: "Christian M. Haas",
  href: "/magazin/christian-m-haas/",
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

/** Das Titelbild steht schon im Hero: gleiches Bild am Textanfang entfernen. */
function stripLeadImage(html: string, imageUrl?: string | null) {
  if (!imageUrl) return html;
  const file = imageUrl.split("/").pop()?.replace(/-\d+x\d+(?=\.[a-z]+$)/i, "").replace(/\.[a-z]+$/i, "");
  if (!file) return html;
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^\\s*(?:<p>\\s*)?(?:<figure[^>]*>\\s*)?(?:<a[^>]*>\\s*)?<img[^>]*${escaped}[^>]*>(?:\\s*</a>)?(?:\\s*<figcaption[\\s\\S]*?</figcaption>)?(?:\\s*</figure>)?(?:\\s*</p>)?`, "i");
  return html.replace(pattern, "");
}

function sanitizeContent(html?: string | null, tocItems: TocItem[] = [], cityName = "deiner Stadt", leadImageUrl?: string | null) {
  const cleaned = stripLeadImage(html || "", leadImageUrl)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\sdata-srcset=/gi, " srcset=")
    .replace(/\sdata-src=/gi, " src=")
    .replace(/class=("|')([^"']*?)lazyload([^"']*?)(\1)/gi, 'class="$2$3"')
    .replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy"')
    .replace(/<img(?![^>]*decoding=)/gi, '<img decoding="async"');

  return injectInlineCta(addHeadingIds(withSlashedPageLinks(cleaned), tocItems), cityName);
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
  const label = placeTypeLabels[key] || type || "Ort";
  return label.charAt(0).toUpperCase() + label.slice(1);
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
        mapsUrl: place.place_maps_url || null,
        openingHours: place.place_opening_hours || null,
        tip: place.place_tip_text || null,
      } as ParsedPlace;
    })
    .filter((place): place is ParsedPlace => Boolean(place));
}

function normalizeStatCards(cards?: WpCityStatCard[] | null) {
  return (cards || []).filter((card) => (card?.label || card?.value || card?.description));
}

function normalizeScore(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(",", "."));
  return Number.isFinite(numeric) ? numeric : null;
}

function formatScoreValue(score: number) {
  return score.toLocaleString("de-DE", { minimumFractionDigits: score % 1 ? 1 : 0, maximumFractionDigits: 1 });
}

function scoreHeadline(score: number) {
  if (score >= 90) return "Sehr aktiv: viele echte Singles zum Kennenlernen";
  if (score >= 80) return "Aktiv und lebendig: gute Chancen auf neue Kontakte";
  if (score >= 70) return "Gute Dating-Chancen: Singles mit deinen Interessen";
  if (score >= 60) return "Solide: reguläre Dating-Aktivität erwartet";
  return "Kleinere Szene: braucht etwas Geduld, aber echte Chancen";
}

function scoreSummary(cityName: string, score: number, text?: string | null) {
  if (text) return `${cityName}: ${formatScoreValue(score)} Punkte. ${text}`;
  return `${cityName} hat viele aktive Singles ab 50, gute Date-Orte und eine niedrige Hemmschwelle für den Einstieg. Eine echte Chance, neue Menschen kennenzulernen.`;
}

function cityHeroEyebrow(value: string | null | undefined, cityName: string) {
  const fallback = `Partnersuche ab 50 in ${cityName}`;
  if (!value) return fallback;

  const normalized = value.trim();
  if (!normalized) return fallback;
  if (/elflirt/i.test(normalized)) return fallback;

  return normalized;
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
  const description = cityLead(city) || `Partnersuche ab 50 in ${cityName}: echte Singles, erste Date-Ideen, Treffpunkte. Kostenlos Profile ansehen und Nachrichten schreiben.`;

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

function SourceBox({
  sources,
  intro,
  reviewNote,
  displayMode,
  cityName,
}: {
  sources: WpSourceItem[];
  intro?: string | null;
  reviewNote?: string | null;
  displayMode?: string | null;
  cityName?: string;
}) {
  if (displayMode === "hidden" || (!sources.length && !reviewNote)) return null;

  return (
    <section className="abc-sources" aria-label="Quellen und Aktualität">
      <p className="ab-eyebrow">Quellen, Bilder &amp; Aktualität</p>
      {intro ? <p>{intro}</p> : <p>Die Daten und Fakten stammen aus öffentlichen Quellen und zeigen die Situation in {cityName} für Singles ab 50.</p>}
      {reviewNote ? <p className="abc-sources-note">{reviewNote}</p> : null}
      {sources.length ? (
        <ul>
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
  const lead = cityLead(city) || `Hier erfährst du, wo Singles ab 50 in ${cityName} leichter ins Gespräch kommen, welche Orte sich für erste Dates eignen und wie du kostenlos starten kannst.`;
  const publicSlugMap = buildPublicSlugMap(publicCitySlugs);
  const cityTiles = allCities.map((item: typeof allCities[number]) => {
    const itemName = item.acf?.city_name || sanitizeTitle(item.title);
    const itemPath = cityPath(publicSlugMap.get(item.slug) || item.slug);
    return {
      key: item.slug,
      name: itemName,
      path: itemPath,
      href: itemPath,
      hasImage: Boolean(item.featuredImage?.sourceUrl),
      image: item.featuredImage?.sourceUrl ? {
        src: item.featuredImage.sourceUrl,
        alt: item.featuredImage.altText || `Singles ab 50 aus ${itemName}`,
        width: item.featuredImage.width || 900,
        height: item.featuredImage.height || 600,
      } : null,
    };
  });
  const furtherCities = pickFurtherCities(cityTiles, cityPath(publicSlugMap.get(city.slug) || city.slug));
  const readingMinutes = estimateReadingTime(city.content);
  const tocItems = extractTocItems(city.content);
  const safeHtml = sanitizeContent(city.content, tocItems, cityName, city.featuredImage?.sourceUrl);
  const sources = normalizeSources(city.acf?.sources);
  const heroChips = linesFromTextarea(city.acf?.city_hero_chips);
  const trustPoints = linesFromTextarea(city.acf?.city_trust_points);
  const iconyLocation = getIconyWidgetLocationForRoute(slug, 49);
  const singlesSearchUrl = citySearchUrl("de", slug);
  const score = normalizeScore(city.acf?.flirt_factor_score);
  const statCards = normalizeStatCards(city.acf?.local_stat_cards);
  const splitTips = splitCityTips(city.acf?.local_tips);
  const places = normalizePlaces(city.acf?.local_places);
  const primaryCtaHref = city.acf?.primary_cta_url || cityRegistrationLink();
  const primaryCtaLabel = city.acf?.primary_cta_label || "Kostenlos starten";
  const sidebarCtaHref = city.acf?.city_sidebar_cta_url || primaryCtaHref;
  const sidebarCtaLabel = city.acf?.city_sidebar_cta_label || primaryCtaLabel;
  const overview = marketPartnersuchePath("de");
  const finalCtaEyebrow = city.acf?.city_cta_eyebrow || "Nächster Schritt";
  const finalCtaTitle = city.acf?.city_cta_title || `Starte kostenlos und entdecke neue Kontakte in ${cityName}.`;
  const finalCtaText = city.acf?.city_cta_text || "Oder schau dir weitere Städte und Magazin-Themen in Ruhe an.";
  const citySignals = uniqueNonEmpty([
    city.acf?.city_hero_claim,
    ...trustPoints,
    ...(city.acf?.city_hero_claim || trustPoints.length ? [] : [city.acf?.city_dating_angle]),
  ]).slice(0, 4);
  const heroChipItems = uniqueNonEmpty([
    ...heroChips.filter((chip) => !/flirt-faktor/i.test(chip)),
    ...(heroChips.length ? [] : ["Singles ab 50", `Treffpunkte in ${cityName}`, "Kostenlos starten"]),
  ]).slice(0, 4);
  const stripFacts = [
    ...(score !== null ? [{ icon: "spark" as const, label: "Flirt-Faktor", value: `${formatScoreValue(score)} von 100` }] : []),
    ...statCards.slice(0, 2).map((card, index) => ({ icon: index ? "pin" as const : "users" as const, label: card.label || "Kennzahl", value: String(card.value || cityName) })),
    { icon: "clock" as const, label: "Lesezeit", value: `ca. ${readingMinutes} Minuten` },
    { icon: "heart" as const, label: "Anmeldung", value: "kostenlos" },
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
      { "@type": "ListItem", position: 1, name: "Partnersuche", item: absoluteUrl("/partnersuche/") },
      { "@type": "ListItem", position: 2, name: cityName, item: absoluteUrl(cityPath(slug)) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <article className="abc">
        <CityHero
          crumbs={[{ label: "Partnersuche", href: overview.publicUrl, previewHref: overview.previewPath }, { label: cityName }]}
          badge={`Stadtporträt · ${cityHeroEyebrow(city.acf?.hero_eyebrow, cityName)}`}
          title={title}
          lead={lead}
          chips={heroChipItems}
          primary={{ label: `Singles ab 50 in ${cityName} finden`, href: primaryCtaHref }}
          secondary={{ label: "Zum Stadtporträt ↓", href: "#stadtportraet" }}
          image={city.featuredImage?.sourceUrl ? { src: city.featuredImage.sourceUrl, alt: city.featuredImage.altText || title } : null}
          aside={
            <FlirtDial
              cityName={cityName}
              score={score}
              headline={score !== null ? scoreHeadline(score) : (city.acf?.city_profile_card_title || `Neue Kontakte in ${cityName}`)}
              text={city.acf?.city_profile_card_text || city.acf?.flirt_factor_text || city.acf?.city_dating_angle}
            />
          }
        />

        <FactStrip facts={stripFacts} />

        <div className="abc-widget">
          <IconyIframeSinglesWidget
            city={cityName}
            platformId={siteConfig.icony.projectKey}
            location={iconyLocation}
            searchUrl={singlesSearchUrl}
            profileClickUrl={siteConfig.links.registrationLocation}
            eyebrow={city.acf?.city_singles_widget_eyebrow || undefined}
            title={city.acf?.city_singles_widget_title || `Wer in ${cityName} gerade sucht`}
            text={city.acf?.city_singles_widget_text || undefined}
            ctaLabel={city.acf?.city_singles_widget_cta_label || undefined}
            note={city.acf?.city_singles_widget_note || undefined}
          />
        </div>

        {score !== null ? (
          <section className="ab-wrap ab-section abc-score" aria-label={`Flirt-Faktor ${cityName}`}>
            <div className="abc-score-card">
              <span className="abc-score-number">{formatScoreValue(score)}</span>
              <div>
                <p className="ab-eyebrow">Flirt-Faktor {cityName}</p>
                <h2>{scoreHeadline(score)}</h2>
                <p>{scoreSummary(cityName, score, city.acf?.flirt_factor_text)}</p>
              </div>
            </div>
          </section>
        ) : null}

        <StatCardsSection
          cityName={cityName}
          cards={statCards.map((card) => ({ label: card.label || "Kennzahl", value: String(card.value || cityName), description: card.description }))}
          note={city.acf?.content_review_note}
        />
        <SignalSection cityName={cityName} strengths={splitTips.strengths} weaknesses={splitTips.weaknesses} />
        <PlacesSection
          cityName={cityName}
          eyebrow={city.acf?.local_places_eyebrow}
          title={city.acf?.local_places_title}
          intro={city.acf?.local_places_intro}
          places={places}
        />
        <TipsSection
          cityName={cityName}
          tips={splitTips.generalTips}
          eyebrow={city.acf?.local_tips_eyebrow}
          title={city.acf?.local_tips_title}
          intro={city.acf?.local_tips_intro}
        />

        <GuideSection
          cityName={cityName}
          toc={tocItems}
          sidebar={
            <>
              {citySignals.length ? (
                <section className="abc-side-card" aria-label="Kurz zusammengefasst">
                  <p className="ab-eyebrow">{city.acf?.city_trust_eyebrow || "Kurz gesagt"}</p>
                  <ul>{citySignals.map((point) => <li key={point}>{point}</li>)}</ul>
                </section>
              ) : null}
              <a className="abc-side-banner" href={sidebarCtaHref}>
                <Image
                  src={staticAsset("/ab50-banner-conversion-langformat.png")}
                  alt="Neue Menschen ab 50 in deiner Nähe kennenlernen"
                  width={1200}
                  height={800}
                  sizes="300px"
                />
                <span>{sidebarCtaLabel}</span>
              </a>
            </>
          }
        >
          <div className="abc-content ab-rich" dangerouslySetInnerHTML={{ __html: safeHtml }} />
          <SourceBox
            sources={sources}
            intro={city.acf?.sources_intro || null}
            reviewNote={city.acf?.content_review_note}
            displayMode={city.acf?.sources_display_mode || "auto"}
            cityName={cityName}
          />
          <AuthorBox
            name={cityAuthor.name}
            role={cityAuthor.role}
            imageSrc={cityAuthor.imageSrc}
            href={cityAuthor.href}
            text={`Christian M. Haas schreibt über Dating ab 50 – hier mit Ideen für erste Treffen in ${cityName}, typischen Fragen rund ums Kennenlernen und einem einfachen Einstieg in die Partnersuche.`}
            tags={[`Treffpunkte in ${cityName}`, "Erste Dates ab 50", "Sicher kennenlernen"]}
          />
        </GuideSection>

        <div className="ab-wrap ab-section">
          <CityFurtherCities tiles={furtherCities} totalCities={allCities.length} overviewHref={overview.publicUrl} overviewPreviewHref={overview.previewPath} />
        </div>

        <CtaBand
          eyebrow={finalCtaEyebrow}
          title={finalCtaTitle}
          text={finalCtaText}
          primary={{ label: primaryCtaLabel, href: primaryCtaHref }}
          secondary={{ label: "Zum Magazin", href: "/magazin/" }}
        />
      </article>
    </>
  );
}
