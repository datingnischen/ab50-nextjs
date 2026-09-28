import type { Metadata } from "next";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { categoryPath, getAllPages, getCategories, getLatestPosts, pagePath, postPath, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { themeFor } from "@/lib/magazine-themes";
import { marketPartnersuchePath } from "@/lib/markets";
import { ArrowIcon, BookIcon, HeartIcon, ShieldIcon, SparkIcon, UserIcon } from "@/components/ab-icons";
import { PostCard, ThemeIconView } from "@/components/ab-magazine/post-card";
import { CtaBand } from "@/components/ab-city/city-parts";
import "@/components/ab-magazine/ab-magazine.css";

export const metadata: Metadata = {
  title: "50plus Magazin – alle Beiträge im Überblick",
  description: "Aktuelle Themen aus dem 50plus Magazin: Dating ab 50, Beziehung, Vertrauen, Profil und Neuanfang.",
  alternates: { canonical: "/magazin/" },
  openGraph: {
    title: "50plus Magazin – alle Beiträge im Überblick",
    description: "Tipps zu Dating, Profil, Sicherheit und Partnersuche für Singles ab 50.",
    url: absoluteUrl("/magazin/"),
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
  },
};

const AUTHOR_IMAGE = "https://ab50.de/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png";

function pageKind(slug: string) {
  if (slug.includes("christian")) return { label: "Über den Autor", icon: <UserIcon /> };
  if (slug.includes("inhaltsverzeichnis")) return { label: "Übersicht", icon: <BookIcon /> };
  if (slug.includes("sudoku") || slug.includes("kreuzwort")) return { label: "Spiel & Pause", icon: <SparkIcon /> };
  return { label: "Ratgeber", icon: <BookIcon /> };
}

export default async function MagazinOverviewPage() {
  const [posts, categories, pages] = await Promise.all([
    getLatestPosts(36),
    getCategories(24),
    getAllPages(),
  ]);

  const [featured, ...rest] = posts;
  const visiblePages = pages.filter((page) => page.slug);
  const partnersuche = marketPartnersuchePath("de");

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteConfig.magazineName,
    url: absoluteUrl("/magazin/"),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: stripHtml(post.title),
      url: absoluteUrl(postPath(post.slug)),
      datePublished: post.date,
      dateModified: post.modified,
      image: post.featuredImage?.sourceUrl,
    })),
    hasPart: visiblePages.map((page) => ({
      "@type": "WebPage",
      name: stripHtml(page.title),
      url: absoluteUrl(pagePath(page.slug)),
      dateModified: page.modified,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <article className="abg">
        <header className="ab-hero abg-hero">
          <div className="ab-wrap abg-hero-grid">
            <div>
              <span className="ab-badge"><BookIcon />ab50.de · 50plus Magazin</span>
              <h1>Dating ab 50: Sicherheit, Klarheit und <em>echte Verbindungen.</em></h1>
              <p className="ab-lead">Tipps zu Profil, ersten Gesprächen, Sicherheit und neuen Kontakten – für Singles ab 50, die es direkt angehen wollen.</p>
              <ul className="ab-chips">
                <li><strong>{posts.length}</strong> Beiträge</li>
                <li><strong>{categories.length}</strong> Themenwelten</li>
                <li>Von Christian M. Haas &amp; Redaktion</li>
              </ul>
              <div className="ab-actions">
                <a className="ab-btn ab-btn-primary" href="#articles">Neueste Beiträge lesen</a>
                <a className="ab-btn ab-btn-ghost" href="#themen">Themen entdecken</a>
              </div>
            </div>
            {featured ? (
              <div className="abg-hero-feature">
                <span className="abg-hero-kicker"><SparkIcon />Neu im Magazin</span>
                <PostCard post={featured} categories={categories} large />
              </div>
            ) : null}
          </div>
        </header>

        <nav className="ab-wrap abg-themenav" aria-label="Kategorien">
          <a href="/magazin/" aria-current="page">Alle Themen</a>
          {categories.map((category) => <a key={category.slug} href={categoryPath(category.slug)}>{category.name}</a>)}
        </nav>

        <section id="themen" className="ab-wrap ab-section" aria-labelledby="abg-themes-title">
          <div className="ab-head">
            <p className="ab-eyebrow"><HeartIcon />Themenwelten</p>
            <h2 id="abg-themes-title">Worüber möchtest du lesen?</h2>
            <p>Von der ersten Nachricht bis zur neuen Partnerschaft: Die Beiträge sind nach Themen sortiert, damit du schnell findest, was dich gerade beschäftigt.</p>
          </div>
          <div className="abg-themes">
            {categories.map((category) => {
              const theme = themeFor(category.slug);
              return (
                <a key={category.slug} className={`abg-theme abg-tone-${theme.tone}`} href={categoryPath(category.slug)}>
                  <ThemeIconView icon={theme.icon} />
                  <strong>{category.name}</strong>
                  <span>{category.description || `Beiträge zum Thema ${category.name}.`}</span>
                  <em>{category.count ? `${category.count} Beiträge` : "Thema öffnen"} <ArrowIcon /></em>
                </a>
              );
            })}
          </div>
        </section>

        <section className="ab-wrap ab-section abg-author-band" aria-label="Autor">
          {/* eslint-disable-next-line @next/next/no-img-element -- Autorenfoto aus WordPress */}
          <img src={AUTHOR_IMAGE} alt="Christian M. Haas" width={140} height={172} loading="lazy" />
          <div>
            <p className="ab-eyebrow">Wer hier schreibt</p>
            <h2>Christian M. Haas – Dating-Experte mit Blick fürs Alltägliche</h2>
            <p>Die Beiträge im 50plus Magazin sind aus echten Fragen von Singles ab 50 entstanden: ruhig, verständlich und praxisnah – ohne Floskeln.</p>
            <a className="ab-btn ab-btn-outline ab-btn-small" href="/magazin/christian-m-haas/">Zum Autorenprofil <ArrowIcon /></a>
          </div>
        </section>

        <section id="articles" className="ab-wrap ab-section" aria-labelledby="abg-latest-title">
          <div className="ab-head">
            <p className="ab-eyebrow"><SparkIcon />Neu im Magazin</p>
            <h2 id="abg-latest-title">Aktuelle Beiträge zu Dating, Profil und Sicherheit</h2>
            <p>Finde praktische Antworten auf deine Dating-Fragen.</p>
          </div>
          <div className="abg-grid">
            {rest.map((post) => <PostCard key={post.slug} post={post} categories={categories} />)}
          </div>
        </section>

        <section className="ab-wrap ab-section abg-safety" aria-label="Sicherheit">
          <div>
            <p className="ab-eyebrow"><ShieldIcon />Gut zu wissen</p>
            <h2>Sicher beim Online-Dating ab 50</h2>
            <p>Wie du sichere Entscheidungen triffst, Fake-Profile erkennst und Warnsignale wie Geldforderungen früh durchschaust.</p>
          </div>
          <a className="ab-btn ab-btn-primary" href="/magazin/kategorie/sicherheit-vertrauen/">Zu den Sicherheitstipps <ArrowIcon /></a>
        </section>

        {visiblePages.length ? (
          <section className="ab-wrap ab-section" aria-labelledby="abg-pages-title">
            <div className="ab-head">
              <p className="ab-eyebrow"><BookIcon />Ausführlich erklärt</p>
              <h2 id="abg-pages-title">Spezialseiten und Guides</h2>
            </div>
            <ul className="abg-pages">
              {visiblePages.map((page) => {
                const kind = pageKind(page.slug);
                return (
                  <li key={page.slug}>
                    <a href={pagePath(page.slug)}>
                      {kind.icon}
                      <span><small>{kind.label}</small><strong>{stripHtml(page.title)}</strong></span>
                      <ArrowIcon />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <CtaBand
          eyebrow="Nächster Schritt"
          title="Wenn du nicht nur lesen, sondern neue Kontakte aufbauen möchtest"
          text="Starte kostenlos auf ab50.de und triff echte Menschen, die ebenfalls bereit sind für echte Verbindungen."
          primary={{ label: "Kostenlos starten", href: siteConfig.links.registrationCommon }}
          secondary={{ label: "Singles in deiner Stadt", href: partnersuche.publicUrl, previewHref: partnersuche.previewPath }}
        />
      </article>
    </>
  );
}
