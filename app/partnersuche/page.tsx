import Image from "next/image";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { cityPath, getAllCities, getAllPublicCitySlugs, normalizeCitySlug, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Partnersuche ab 50 in deiner Stadt",
  description: "Stadtseiten für Singles ab 50: regionale Orientierung, Dating-Inhalte und lokale Einstiege aus dem ab50.de Magazin.",
  alternates: { canonical: "/partnersuche" },
  openGraph: {
    title: "Partnersuche ab 50 in deiner Stadt",
    description: "Stadtseiten für Singles ab 50: regionale Orientierung, Dating-Inhalte und lokale Einstiege aus dem ab50.de Magazin.",
    url: absoluteUrl("/partnersuche"),
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
  },
};

function buildPublicSlugMap(citySlugs: string[]) {
  return new Map(citySlugs.map((slug) => [normalizeCitySlug(slug), slug]));
}

export default async function PartnersucheOverviewPage() {
  const [cities, publicCitySlugs] = await Promise.all([getAllCities(), getAllPublicCitySlugs()]);
  const publicSlugMap = buildPublicSlugMap(publicCitySlugs);

  return (
    <section className="container section-block city-overview-page">
      <div className="category-hero-card city-overview-hero">
        <div className="category-hero-copy">
          <p className="eyebrow">Partnersuche ab 50</p>
          <h1>Singles ab 50 in deiner Stadt finden</h1>
          <p className="lead">Hier findest du unsere regionalen Stadtseiten für Menschen, die neue Kontakte, Gespräche und echte Begegnungen in ihrer Nähe suchen.</p>
          <div className="trust-chip-row" aria-label="Vorteile der Stadtseiten">
            <span>Regionale Orientierung</span>
            <span>Singles ab 50</span>
            <span>Aktuell gepflegt</span>
          </div>
          <div className="hero-actions">
            <a className="button-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
            <a className="button-secondary" href="/magazin">Zum Magazin</a>
          </div>
        </div>
        <aside className="category-hero-sidecard" aria-label="Was dich hier erwartet">
          <p className="eyebrow">Schneller Überblick</p>
          <strong>Regionale Einstiege für Dating ab 50</strong>
          <p>Die Stadtseiten helfen dir dabei, deine Partnersuche regionaler zu denken und schneller zu passenden Inhalten für deine Umgebung zu kommen.</p>
        </aside>
      </div>

      <div className="section-heading wide-heading">
        <p className="eyebrow">Städte im Überblick</p>
        <h2>Unsere regionalen Seiten</h2>
      </div>

      <div className="post-grid">
        {cities.map((city) => {
          const publicSlug = publicSlugMap.get(city.slug) || city.slug;
          return (
            <a className="post-card" href={cityPath(publicSlug)} key={city.slug}>
              {city.featuredImage?.sourceUrl ? (
                <Image
                  src={city.featuredImage.sourceUrl}
                  alt={city.featuredImage.altText || city.title}
                  width={city.featuredImage.width || 900}
                  height={city.featuredImage.height || 600}
                  className="post-card-image"
                  sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"
                />
              ) : (
                <div className="post-card-placeholder" />
              )}
              <div className="post-card-body">
                <span>Regionale Partnersuche</span>
                <strong>{city.acf?.city_name ? `Singles ab 50 aus ${city.acf.city_name}` : stripHtml(city.title)}</strong>
                <p>{city.acf?.city_hero_claim || city.acf?.city_dating_angle || "Finde den regionalen Einstieg in deine Partnersuche ab 50 – ruhig, verständlich und nah an deiner Stadt."}</p>
                <em className="card-read-more">Stadtseite ansehen</em>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
