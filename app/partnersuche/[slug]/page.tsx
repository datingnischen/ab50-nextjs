import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { cityPath, getAllCities, getAllPublicCitySlugs, getCityByPublicSlug, normalizeCitySlug, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { formatGermanDate } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type TocItem = { id: string; label: string };

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
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/&amp;/g, "und")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "abschnitt";
}

function extractTocItems(html?: string | null): TocItem[] {
  const source = html || "";
  const seen = new Map<string, number>();
  return Array.from(source.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
    .map((match) => stripHtml(match[1]))
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
        {items.map((item) => (
          <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
        ))}
      </ol>
    </nav>
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
  const relatedCities = allCities.filter((item) => item.slug !== city.slug).slice(0, 6);
  const readingMinutes = estimateReadingTime(city.content);
  const tocItems = extractTocItems(city.content);
  const safeHtml = sanitizeContent(city.content, tocItems, cityName);
  const lastUpdated = city.modified ? formatGermanDate(city.modified) : null;
  const citySignals = uniqueNonEmpty([
    city.acf?.city_hero_claim,
    city.acf?.city_dating_angle,
    `Singles ab 50 in ${cityName}`,
  ]).slice(0, 2);
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
      <article className="container article-page city-page">
        <div className="category-hero-card city-overview-hero city-detail-hero">
          <div className="category-hero-copy">
            <nav className="article-breadcrumbs" aria-label="Breadcrumb">
              <a href="/partnersuche">Partnersuche</a>
              <span aria-hidden="true">/</span>
              <span>{cityName}</span>
            </nav>
            <p className="eyebrow">Partnersuche ab 50 in {cityName}</p>
            <h1>{title}</h1>
            <p className="lead">{lead}</p>
            <div className="trust-chip-row" aria-label="Stadtvorteile">
              <span>Singles ab 50</span>
              <span>Regionale Orientierung</span>
              <span>Kostenlos starten</span>
            </div>
            <div className="hero-actions">
              <a className="button-primary" href={cityRegistrationLink()}>Kostenlos starten</a>
              <a className="button-secondary" href="/partnersuche">Alle Städte</a>
            </div>
          </div>
          <aside className="category-hero-sidecard city-hero-sidecard" aria-label="Schneller Überblick">
            {city.featuredImage?.sourceUrl ? (
              <Image
                src={city.featuredImage.sourceUrl}
                alt={city.featuredImage.altText || title}
                width={city.featuredImage.width || 1200}
                height={city.featuredImage.height || 700}
                className="article-hero-image city-side-image"
                sizes="(max-width: 980px) 100vw, 380px"
                priority
              />
            ) : null}
            <div className="city-sidecard-copy">
              <p className="eyebrow">Schneller Überblick</p>
              <strong>Was dich auf dieser Seite erwartet</strong>
              <ul className="city-hero-sidecard-list">
                {quickFacts.map((fact) => (
                  <li key={fact.label}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <section className="overview-intent-grid city-intro-grid" aria-label="Schnelleinstieg">
          <article className="overview-intent-card overview-intent-card-guide city-intro-card">
            <span>Regionaler Einstieg</span>
            <strong>Dating ab 50 in {cityName} verständlich einordnen</strong>
            <p>Die Seite bündelt regionale Hinweise, typische Fragen und einen ruhigen Einstieg für Menschen, die in {cityName} neue Kontakte suchen.</p>
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

        <section className="article-body-grid city-body-grid">
          <aside className="article-side-column city-side-column">
            <div className="city-sidebar-stack">
              <TableOfContents items={tocItems} />
              <section className="city-sidebar-card" aria-label="Kurz zusammengefasst">
                <p className="eyebrow">Kurz gesagt</p>
                <strong>Darum lohnt sich die Seite für {cityName}</strong>
                <ul className="city-key-points">
                  {citySignals.map((point) => <li key={point}>{point}</li>)}
                  <li>Direkte Wege zu weiteren regionalen Einstiegen und zum Magazin</li>
                </ul>
              </section>
              <section className="city-sidebar-card city-sidebar-cta" aria-label="Kostenlos starten">
                <p className="eyebrow">Bereit für den nächsten Schritt?</p>
                <strong>Starte kostenlos und schau dich in deiner Region um.</strong>
                <p>Ohne Druck, aber mit einem klaren nächsten Schritt für neue Kontakte ab 50.</p>
                <a className="button-primary" href={cityRegistrationLink()}>Kostenlos starten</a>
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

            <div className="article-content-card">
              <div className="article-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />
            </div>

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
              {relatedCities.map((item) => {
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
            <p className="eyebrow">Nächster Schritt</p>
            <h2>Wenn du magst, kannst du jetzt direkt kostenlos starten und neue Kontakte in {cityName} entdecken.</h2>
            <p>Oder du schaust dir weitere Städte und Magazin-Themen in Ruhe an.</p>
          </div>
          <div className="overview-cta-actions">
            <a className="button-primary" href={cityRegistrationLink()}>Kostenlos starten</a>
            <a className="button-secondary" href="/magazin">Zum Magazin</a>
          </div>
        </section>
      </article>
    </>
  );
}
