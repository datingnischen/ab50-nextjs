import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import { categoryPath, getCategories, getPostsByCategory, postPath, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { formatGermanDate } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { getCategories } = await import("@/lib/wordpress");
  const categories = await getCategories(50);
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPostsByCategory(slug, 1);
  if (!category) return {};
  const title = `${category.name} – 50plus Magazin`;
  const description = category.description || `Alle Beiträge aus dem 50plus Magazin zum Thema ${category.name}.`;

  return {
    title,
    description,
    alternates: { canonical: categoryPath(category.slug) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(categoryPath(category.slug)),
      type: "website",
      locale: "de_DE",
      siteName: siteConfig.name,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    getPostsByCategory(slug, 24),
    getCategories(50),
  ]);
  if (!category) notFound();

  const relatedCategories = allCategories.filter((item) => item.slug !== category.slug).slice(0, 6);
  const featuredPosts = category.posts.slice(0, 2);

  return (
    <section className="container section-block category-page">
      <div className="category-hero-card">
        <div className="category-hero-copy">
          <nav className="article-breadcrumbs" aria-label="Breadcrumb">
            <a href="/magazin">50plus Magazin</a>
            <span aria-hidden="true">/</span>
            <span>{category.name}</span>
          </nav>
          <p className="eyebrow">Magazin-Kategorie</p>
          <h1>{category.name}</h1>
          <p className="lead">{category.description || `Alle Beiträge aus dem 50plus Magazin zum Thema ${category.name}.`}</p>
          <div className="trust-chip-row" aria-label="Was du hier findest">
            <span>Echte Tipps zum Thema</span>
            <span>Von Dating-Experten</span>
            <span>Für Singles ab 50</span>
          </div>
          <div className="hero-actions">
            <a className="button-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
            <a className="button-secondary" href="/magazin">Alle Themen ansehen</a>
          </div>
        </div>
        <aside className="category-hero-sidecard" aria-label="Beliebte Artikel in dieser Rubrik">
          <p className="eyebrow">Top Artikel</p>
          <strong>Meistgelesen in {category.name.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</strong>
          <p>Diese Beiträge helfen dir am schnellsten weiter: Praktische Tipps, echte Lösungen und das Wichtigste zu diesem Thema — ohne Umschweife.</p>
          <div className="index-mini-list">
            {featuredPosts.map((post) => (
              <a href={postPath(post.slug)} key={post.slug}>{stripHtml(post.title)}</a>
            ))}
          </div>
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
          <p className="eyebrow">Von Christian M. Haas</p>
          <strong>Warum diese Tipps wirklich helfen</strong>
          <p>Die Artikel in dieser Rubrik sind aus echten Fragen und Erfahrungen entstanden — damit du Antworten findest, die wirklich passen und umsetzbar sind.</p>
          <a className="card-read-more" href="/magazin/christian-m-haas">Mehr zum Autorenprofil von Christian M. Haas</a>
        </div>
      </div>

      {relatedCategories.length ? (
        <div className="category-topic-strip" aria-label="Weitere Magazin-Themen">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Weitere Themen</p>
            <h2>Vielleicht auch interessant für dich</h2>
          </div>
          <div className="category-topic-grid">
            {relatedCategories.map((item) => (
              <a className="category-topic-card" href={categoryPath(item.slug)} key={item.slug}>
                <span>{item.name}</span>
                <strong>{item.description || `Mehr Orientierung und Beiträge aus dem 50plus Magazin zu ${item.name.toLowerCase()}.`}</strong>
                <em className="card-read-more">Thema öffnen</em>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="section-heading wide-heading">
        <p className="eyebrow">Beiträge in dieser Rubrik</p>
        <h2>Alle Artikel zu {category.name}</h2>
      </div>

      <div className="post-grid">
        {category.posts.map((post) => (
          <a className="post-card" href={postPath(post.slug)} key={post.slug}>
            {post.featuredImage?.sourceUrl ? (
              <Image
                src={post.featuredImage.sourceUrl}
                alt={post.featuredImage.altText || stripHtml(post.title)}
                width={post.featuredImage.width || 900}
                height={post.featuredImage.height || 600}
                className="post-card-image"
                sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"
              />
            ) : (
              <div className="post-card-placeholder" />
            )}
            <div className="post-card-body">
              <span>{formatGermanDate(post.date) || siteConfig.magazineName}</span>
              <strong>{stripHtml(post.title)}</strong>
              <p>{stripHtml(post.excerpt).slice(0, 160)}…</p>
              <em className="card-read-more">Beitrag lesen</em>
            </div>
          </a>
        ))}
      </div>

      <section className="overview-cta-strip category-final-cta" aria-label="Weitere Schritte">
        <div>
          <p className="eyebrow">Mehr entdecken</p>
          <h2>Such dir den nächsten Einstieg aus dem Magazin oder starte direkt auf ab50.de.</h2>
          <p>Wenn du lieber direkt aktiv werden willst, kannst du kostenlos starten oder noch weitere Themen aus dem Magazin in Ruhe durchstöbern.</p>
        </div>
        <div className="overview-cta-actions">
          <a className="button-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
          <a className="button-secondary" href="/magazin">Zum Magazin</a>
        </div>
      </section>
    </section>
  );
}
