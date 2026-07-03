import Image from "next/image";
import type { Metadata } from "next";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { categoryPath, getAllPages, getCategories, getLatestPosts, pagePath, postPath, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { formatGermanDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "50plus Magazin – alle Beiträge im Überblick",
  description: "Aktuelle Themen aus dem 50plus Magazin: Dating ab 50, Beziehung, Vertrauen, Profil und Neuanfang.",
  alternates: { canonical: "/magazin" },
  openGraph: {
    title: "50plus Magazin – alle Beiträge im Überblick",
    description: "Ratgeber, Orientierung und Dating-Themen für Singles ab 50.",
    url: absoluteUrl("/magazin"),
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
  },
};

type PagePresentation = {
  label: string;
  icon: string;
  description: string;
  className: string;
};

function getPagePresentation(title: string, slug?: string | null): PagePresentation {
  const haystack = `${title} ${slug || ""}`.toLowerCase();
  if (haystack.includes("christian") || haystack.includes("autor")) {
    return {
      label: "Autor & Einordnung",
      icon: "✓",
      description: "Mehr Hintergrund zur redaktionellen Stimme und fachlichen Einordnung.",
      className: "magazine-page-card-expert",
    };
  }
  if (haystack.includes("inhaltsverzeichnis")) {
    return {
      label: "Schnell finden",
      icon: "◎",
      description: "Ein strukturierter Einstieg in weitere Magazin-Themen und Inhalte.",
      className: "magazine-page-card-guide",
    };
  }
  if (haystack.includes("sudoku") || haystack.includes("kreuzwort")) {
    return {
      label: "Aktiv & entspannt",
      icon: "✦",
      description: "Leichte Angebote für Menschen, die zwischendurch Ruhe, Spaß und Aktivierung suchen.",
      className: "magazine-page-card-lifestyle",
    };
  }
  return {
    label: "Ratgeberseite",
    icon: "→",
    description: "Ein weiterführender Einstieg aus dem 50plus Magazin.",
    className: "magazine-page-card-guide",
  };
}

export default async function MagazinOverviewPage() {
  const [posts, categories, pages] = await Promise.all([
    getLatestPosts(36),
    getCategories(24),
    getAllPages(),
  ]);

  const featuredPosts = posts.slice(0, 3);
  const visiblePages = pages.filter((page) => page.slug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteConfig.magazineName,
    url: absoluteUrl("/magazin"),
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
      <article className="section-index-page section-theme-magazine magazine-index-page">
        <header className="index-hero magazine-index-hero">
          <div className="container index-hero-grid">
            <div>
              <p className="eyebrow">ab50.de · 50plus Magazin</p>
              <h1>Dating, Nähe und Neuanfang ab 50 – verständlich, ruhig und alltagsnah erklärt.</h1>
              <p className="lead">
                Das 50plus Magazin bündelt Themen rund um Online-Dating ab 50, Beziehung, Vertrauen, Profil, Kommunikation und neue Lebensphasen – ohne grelle Hektik, sondern mit Klarheit und Erfahrung.
              </p>
              <div className="trust-chip-row index-chip-row" aria-label="Magazin-Vorteile">
                <span>{posts.length} Beiträge</span>
                <span>{visiblePages.length} Sonderseiten</span>
                <span>Lesefreundlich aufgebaut</span>
                <span>Für Singles 50+</span>
              </div>
              <div className="hero-actions index-actions">
                <a className="button-primary" href="#articles">Neueste Beiträge lesen</a>
                <a className="button-secondary" href="#topics">Themen entdecken</a>
                <a className="button-secondary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
              </div>
            </div>
            <aside className="index-feature-card magazine-feature-card" aria-label="Magazin-Fokus">
              <span>Schwerpunkte</span>
              <strong>Dating mit Ruhe</strong>
              <p>Orientierung für Menschen, die lieber bewusst statt hektisch Kontakte aufbauen möchten.</p>
              <div className="index-mini-list">
                {categories.slice(0, 6).map((category) => (
                  <a href={categoryPath(category.slug)} key={category.slug}>{category.name}</a>
                ))}
              </div>
            </aside>
          </div>
        </header>

        <section className="container index-list-section magazine-latest-section" id="articles">
          <div className="index-section-heading">
            <p className="eyebrow">Neu im Magazin</p>
            <h2>Neueste Beiträge aus dem 50plus Magazin</h2>
            <p>Wähle den Beitrag, der gerade zu deiner Situation, deinem Tempo und deinem Dating-Thema passt.</p>
          </div>

          <div className="category-filter-row" aria-label="Kategorien">
            {categories.map((category) => (
              <a href={categoryPath(category.slug)} key={category.slug}>
                {category.name}<span>{category.count || 0}</span>
              </a>
            ))}
          </div>

          <div className="section-index-grid magazine-index-grid">
            {posts.map((post) => (
              <a className="section-index-card magazine-index-card" href={postPath(post.slug)} key={post.slug}>
                {post.featuredImage?.sourceUrl ? (
                  <Image
                    src={post.featuredImage.sourceUrl}
                    alt={post.featuredImage.altText || stripHtml(post.title)}
                    width={post.featuredImage.width || 900}
                    height={post.featuredImage.height || 600}
                    className="section-index-image"
                    sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"
                  />
                ) : (
                  <div className="section-index-placeholder" />
                )}
                <div className="section-index-card-body">
                  <span>{formatGermanDate(post.date) || siteConfig.magazineName}</span>
                  <strong>{stripHtml(post.title)}</strong>
                  <p>{stripHtml(post.excerpt).slice(0, 170)}…</p>
                  <em className="card-read-more">Beitrag lesen</em>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="container overview-highlight-section magazine-overview-highlights">
          <div className="index-section-heading">
            <p className="eyebrow">Schnelleinstieg</p>
            <h2>Beliebte Einstiege für Dating ab 50</h2>
            <p>Wenn du direkt Orientierung suchst, helfen diese Einstiege besonders schnell weiter.</p>
          </div>
          <div className="overview-intent-grid">
            {featuredPosts.map((post, index) => (
              <a className="overview-intent-card overview-intent-card-featured" href={postPath(post.slug)} key={post.slug}>
                <span>Aktueller Impuls {index + 1}</span>
                <strong>{stripHtml(post.title)}</strong>
                <p>{stripHtml(post.excerpt).slice(0, 140)}…</p>
              </a>
            ))}
            <a className="overview-intent-card overview-intent-card-guide" href="/magazin/kategorie/online-dating-ab-50">
              <span>Online-Dating</span>
              <strong>Mehr Sicherheit und Klarheit beim Einstieg</strong>
              <p>Tipps für Profile, Gespräche, Erwartungen und erste Kontakte in einer neuen Lebensphase.</p>
            </a>
            <a className="overview-intent-card overview-intent-card-trust" href="/magazin/kategorie/sicherheit-vertrauen">
              <span>Vertrauen</span>
              <strong>Warnsignale, Schutz und gutes Bauchgefühl</strong>
              <p>Ruhige Einordnung zu Fake-Profilen, Grenzen, Sicherheit und einem guten Umgang mit Unsicherheit.</p>
            </a>
          </div>
        </section>

        <section className="container index-list-section magazine-cms-pages-section" id="topics">
          <div className="index-section-heading">
            <p className="eyebrow">Sonderseiten & Orientierung</p>
            <h2>Weitere Magazinseiten und hilfreiche Sonderformate</h2>
            <p>Auch diese bestehenden Magazinseiten bleiben sichtbar und werden sauber in die neue Magazin-Struktur übernommen.</p>
          </div>
          <div className="section-index-grid magazine-page-grid">
            {visiblePages.map((page) => {
              const title = stripHtml(page.title);
              const presentation = getPagePresentation(title, page.slug);
              const teaser = stripHtml(page.content).slice(0, 155);
              return (
                <a className={`section-index-card magazine-page-card ${presentation.className}`} href={pagePath(page.slug)} key={page.slug}>
                  <div className="section-index-card-body magazine-page-card-body">
                    <div className="magazine-page-card-topline">
                      <span>{presentation.label}</span>
                      <i aria-hidden="true">{presentation.icon}</i>
                    </div>
                    <strong>{title}</strong>
                    <p>{teaser || presentation.description}…</p>
                    <em className="card-read-more">Seite öffnen</em>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className="container overview-cta-strip magazine-overview-cta" aria-label="ab50 Registrierung">
          <div>
            <p className="eyebrow">Nächster Schritt</p>
            <h2>Wenn du nicht nur lesen, sondern neue Kontakte aufbauen möchtest</h2>
            <p>Starte kostenlos auf ab50.de und entdecke Menschen, die ebenfalls offen für Nähe, gute Gespräche und einen neuen Abschnitt sind.</p>
          </div>
          <div className="overview-cta-actions">
            <a className="button-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
            <a className="button-secondary" href={siteConfig.links.home}>ab50.de ansehen</a>
          </div>
        </section>
      </article>
    </>
  );
}
