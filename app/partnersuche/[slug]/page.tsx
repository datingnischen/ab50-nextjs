import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import { cityPath, getAllCities, getAllPublicCitySlugs, getCityByPublicSlug, normalizeCitySlug, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function sanitizeContent(html?: string | null) {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy"')
    .replace(/<img(?![^>]*decoding=)/gi, '<img decoding="async"');
}

function buildPublicSlugMap(citySlugs: string[]) {
  return new Map(citySlugs.map((slug) => [normalizeCitySlug(slug), slug]));
}

function cityLead(city: Awaited<ReturnType<typeof getCityByPublicSlug>>) {
  if (!city) return "";
  return city.acf?.hero_lead || city.acf?.city_hero_claim || city.acf?.city_dating_angle || stripHtml(city.content).slice(0, 220);
}

export async function generateStaticParams() {
  const slugs = await getAllPublicCitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityByPublicSlug(slug);
  if (!city) return {};
  const title = city.acf?.hero_title || stripHtml(city.title);
  const description = cityLead(city) || `Regionale Singles ab 50 und Dating-Orientierung für ${city.acf?.city_name || stripHtml(city.title)}.`;

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

export default async function PartnersucheCityPage({ params }: PageProps) {
  const { slug } = await params;
  const [city, allCities, publicCitySlugs] = await Promise.all([
    getCityByPublicSlug(slug),
    getAllCities(),
    getAllPublicCitySlugs(),
  ]);

  if (!city) notFound();

  const title = city.acf?.hero_title || stripHtml(city.title);
  const lead = cityLead(city);
  const publicSlugMap = buildPublicSlugMap(publicCitySlugs);
  const relatedCities = allCities.filter((item) => item.slug !== city.slug).slice(0, 6);

  return (
    <article className="container article-page city-page">
      <div className="category-hero-card city-overview-hero city-detail-hero">
        <div className="category-hero-copy">
          <nav className="article-breadcrumbs" aria-label="Breadcrumb">
            <a href="/partnersuche">Partnersuche</a>
            <span aria-hidden="true">/</span>
            <span>{city.acf?.city_name || title}</span>
          </nav>
          <p className="eyebrow">Regionale Partnersuche</p>
          <h1>{title}</h1>
          {lead ? <p className="lead">{lead}</p> : null}
          <div className="trust-chip-row" aria-label="Stadtvorteile">
            <span>Singles ab 50</span>
            <span>{city.acf?.city_country || "DE"}</span>
            <span>Regionaler Einstieg</span>
          </div>
          <div className="hero-actions">
            <a className="button-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
            <a className="button-secondary" href="/partnersuche">Alle Städte</a>
          </div>
        </div>
        <aside className="category-hero-sidecard" aria-label="Stadtbild">
          {city.featuredImage?.sourceUrl ? (
            <Image
              src={city.featuredImage.sourceUrl}
              alt={city.featuredImage.altText || title}
              width={city.featuredImage.width || 1200}
              height={city.featuredImage.height || 700}
              className="article-hero-image"
              sizes="(max-width: 980px) 100vw, 380px"
            />
          ) : (
            <div className="post-card-placeholder" />
          )}
        </aside>
      </div>

      <div className="category-editorial-note">
        <div className="category-editorial-avatar">
          <Image
            src="https://ab50.de/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png"
            alt="Christian M. Haas"
            width={72}
            height={72}
          />
        </div>
        <div>
          <p className="eyebrow">Redaktion & Einordnung</p>
          <strong>Regionaler Dating-Kontext für Menschen mit Lebenserfahrung</strong>
          <p>Diese Stadtseite gibt dir einen regionalen Einstieg für Dating ab 50 und wird laufend so aufbereitet, dass du schnell zu hilfreichen Inhalten für deine Umgebung kommst.</p>
          <a className="card-read-more" href="/magazin/christian-m-haas">Mehr zum Autorenprofil von Christian M. Haas</a>
        </div>
      </div>

      <div className="article-content-card">
        <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(city.content) }} />
      </div>

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
                  <span>{item.acf?.city_name || stripHtml(item.title)}</span>
                  <strong>{item.acf?.city_hero_claim || item.acf?.city_dating_angle || `Mehr Orientierung und regionale Dating-Inhalte für ${item.acf?.city_name || stripHtml(item.title)}.`}</strong>
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
          <h2>Wenn du magst, kannst du jetzt direkt kostenlos starten und neue Kontakte in deiner Region entdecken.</h2>
          <p>Oder du schaust dir weitere Städte und Magazin-Themen in Ruhe an.</p>
        </div>
        <div className="overview-cta-actions">
          <a className="button-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
          <a className="button-secondary" href="/magazin">Zum Magazin</a>
        </div>
      </section>
    </article>
  );
}
