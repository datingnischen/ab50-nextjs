import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthorBox, CityHero, CtaBand, FactStrip, FlirtDial, GuideSection, PlacesSection } from "@/components/ab-city/city-parts";
import { CityCharacterArt } from "@/components/city-character-art";
import { ChFlirtFactorNote, chCityAuthor, flirtFactorHeadline } from "@/components/ch-city-modules";
import { CityFurtherCities } from "@/components/city-further-cities";
import { CityImageDialog } from "@/components/city-image-dialog";
import { IconyIframeSinglesWidget } from "@/components/icony-iframe-singles-widget";
import { MarketHtml } from "@/components/market-html";
import { getIconyWidgetLocationForRoute } from "@/data/city-widget-locations";
import { getChCityFacts } from "@/data/ch-city-facts";
import { cityArtAltText, cityArtImageSrc } from "@/lib/city-art";
import { getSwissCity, getSwissCitySlugs, swissPartnersuche } from "@/lib/ch-partnersuche";
import { citySearchUrl } from "@/lib/city-search";
import { pickFurtherCities } from "@/lib/further-cities";
import { jsonLd } from "@/lib/seo";
import { marketPartnersuchePath, publicMarketUrl, registrationUrl } from "@/lib/markets";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getSwissCitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getSwissCity(slug);
  if (!city) return {};
  const route = marketPartnersuchePath("ch", city.slug);
  return {
    title: { absolute: `${city.title} | ab50.ch` },
    description: city.description,
    alternates: { canonical: route.publicUrl },
    openGraph: {
      title: city.title,
      description: city.description,
      url: route.publicUrl,
      type: "article",
      locale: "de_CH",
      siteName: "ab50.ch",
      images: [{ url: city.heroImage.url, alt: city.heroImage.alt }],
    },
  };
}

/** Stadtporträt-Überschriften für das Inhaltsverzeichnis (ohne IDs im Import: werden hier ergänzt). */
function withHeadingIds(html: string) {
  const toc: { id: string; label: string }[] = [];
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs: string, inner: string) => {
    const label = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    if (!label || toc.length >= 8) return match;
    const id = `abschnitt-${toc.length + 1}`;
    toc.push({ id, label });
    return /\sid=/.test(attrs) ? match : `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export default async function SwissPartnersucheCityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = getSwissCity(slug);
  if (!city) notFound();

  const facts = getChCityFacts(city.slug);
  const route = marketPartnersuchePath("ch", city.slug);
  const overviewRoute = marketPartnersuchePath("ch");
  const furtherCities = pickFurtherCities(
    swissPartnersuche.cities.map((item) => {
      const itemRoute = marketPartnersuchePath("ch", item.slug);
      return {
        key: item.slug,
        name: item.name,
        path: itemRoute.publicPath,
        href: itemRoute.publicUrl,
        previewHref: itemRoute.previewPath,
        hasImage: true,
        image: {
          src: cityArtImageSrc(item.slug, "thumb"),
          alt: cityArtAltText(item.slug, item.name),
          width: 1000,
          height: 420,
          unoptimized: true,
        },
      };
    }),
    route.publicPath,
  );
  const registration = registrationUrl("ch", "location");
  const search = citySearchUrl("ch", city.slug);
  const guide = withHeadingIds(city.contentHtml);
  const readingMinutes = Math.max(1, Math.ceil(city.contentHtml.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 220));
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: city.title,
    headline: city.title,
    description: city.description,
    url: route.publicUrl,
    inLanguage: "de-CH",
    about: `Partnersuche ab 50 in ${city.name}`,
    image: city.heroImage.url,
    isPartOf: { "@type": "WebSite", name: "ab50.ch", url: publicMarketUrl("ch", "/") },
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Partnersuche Schweiz", item: overviewRoute.publicUrl },
      { "@type": "ListItem", position: 2, name: city.name, item: route.publicUrl },
    ],
  };
  const chips = facts?.heroChips.filter((chip) => !/flirt-faktor/i.test(chip)) ?? ["Singles ab 50", `${city.name} & Umgebung`, "Kostenlos starten"];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <article className="abc market-city-page">
        <CityHero
          crumbs={[{ label: "Partnersuche Schweiz", href: overviewRoute.publicUrl, previewHref: overviewRoute.previewPath }, { label: city.name }]}
          badge="Stadtporträt · Partnersuche ab 50 · Schweiz"
          title={city.title}
          lead={city.description}
          chips={chips}
          primary={{ label: `Singles ab 50 in ${city.name} finden`, href: registration }}
          secondary={{ label: "Zum Stadtporträt ↓", href: "#stadtportraet" }}
          art={<CityCharacterArt slug={city.slug} name={city.name} variant="hero" className="city-art-image" />}
          aside={
            <FlirtDial
              cityName={city.name}
              score={facts?.flirtFaktor ?? null}
              headline={facts ? flirtFactorHeadline(facts.flirtFaktor) : `Neue Kontakte in ${city.name}`}
              text={facts?.flirtFaktorText}
            />
          }
        />

        <FactStrip
          facts={[
            ...(facts ? [
              { icon: "spark" as const, label: "Flirt-Faktor", value: `${facts.flirtFaktor} von 100` },
              { icon: "users" as const, label: "Einwohner", value: facts.einwohner },
              { icon: "pin" as const, label: facts.dritteKachel.label, value: facts.dritteKachel.wert },
            ] : []),
            { icon: "clock" as const, label: "Lesezeit", value: `ca. ${readingMinutes} Minuten` },
            { icon: "heart" as const, label: "Anmeldung", value: "kostenlos" },
          ]}
        />

        <div className="abc-widget">
          <IconyIframeSinglesWidget
            city={city.name}
            platformId="ab50ch"
            location={getIconyWidgetLocationForRoute(city.slug, 41)}
            searchUrl={search}
            profileClickUrl={registration}
            eyebrow="Singles in der Schweiz entdecken"
            title={`Wer in ${city.name} gerade sucht`}
            text={`Schau dir aktuelle Profile aus ${city.name} und Umgebung an oder erweitere den Suchradius direkt auf ab50.ch.`}
            ctaLabel={`Ausführlicher in ${city.name} suchen`}
            note="Kostenlos starten · Schweizer Umkreis wählen · diskret stöbern"
          />
        </div>

        {facts ? (
          <section className="ab-wrap ab-section abc-score" aria-label={`Flirt-Faktor ${city.name}`}>
            <div className="abc-score-card">
              <span className="abc-score-number">{facts.flirtFaktor}</span>
              <div>
                <p className="ab-eyebrow">Flirt-Faktor {city.name}</p>
                <h2>{flirtFactorHeadline(facts.flirtFaktor)}</h2>
                <p>{city.name}: {facts.flirtFaktor} Punkte. {facts.flirtFaktorText}</p>
              </div>
            </div>
          </section>
        ) : null}

        {facts ? (
          <PlacesSection
            cityName={city.name}
            intro="Diese Treffpunkte nennt auch das Stadtporträt weiter unten – sie eignen sich für ein erstes Kennenlernen oder einen entspannten nächsten Schritt."
            places={facts.treffpunkte.map((place) => ({
              name: place.name,
              typeLabel: place.typ,
              category: place.kategorie,
              tip: place.tipp,
              address: `${city.name}, Schweiz`,
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${city.name}, Schweiz`)}`,
            }))}
          />
        ) : null}

        <GuideSection
          cityName={city.name}
          toc={guide.toc}
          sidebar={
            <figure className="abc-side-card abc-stat-figure" aria-label={`${city.name} in Zahlen`}>
              <p className="ab-eyebrow">{city.name} in Zahlen</p>
              <CityImageDialog
                city={city.name}
                imageUrl={city.heroImage.url}
                imageAlt={`Statistik-Grafik: ${city.heroImage.alt}`}
                registrationUrl={registration}
                imageClassName="city-stat-image"
                hint="Grafik vergrössern"
              />
            </figure>
          }
        >
          <div className="abc-content ab-rich">
            <MarketHtml market="ch" html={guide.html} />
          </div>
          {facts ? <ChFlirtFactorNote cityName={city.name} score={facts.flirtFaktor} /> : null}
          <AuthorBox
            name={chCityAuthor.name}
            role={chCityAuthor.role}
            imageSrc={chCityAuthor.imageSrc}
            href={chCityAuthor.href}
            text={`Hier findest du Ideen für erste Dates in ${city.name}, typische Fragen rund ums Kennenlernen und einen einfachen Einstieg, wenn du neue Menschen ab 50 treffen möchtest.`}
            tags={[`Treffpunkte in ${city.name}`, "Erste Dates ab 50", "Schweiz"]}
          />
        </GuideSection>

        <div className="ab-wrap ab-section">
          <CityFurtherCities
            tiles={furtherCities}
            totalCities={swissPartnersuche.cities.length}
            overviewHref={overviewRoute.publicUrl}
            overviewPreviewHref={overviewRoute.previewPath}
          />
        </div>

        <CtaBand
          eyebrow={`Neue Kontakte in ${city.name}`}
          title="Starte kostenlos und entdecke Singles ab 50 aus deiner Region."
          text="Du kannst dich in Ruhe umsehen und selbst entscheiden, wie du den ersten Kontakt gestaltest."
          primary={{ label: "Kostenlos starten", href: registration }}
          secondary={{ label: "Alle Schweizer Städte", href: overviewRoute.publicUrl, previewHref: overviewRoute.previewPath }}
        />
      </article>
    </>
  );
}
