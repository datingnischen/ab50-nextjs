import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import { categoryPath, getCategories, getPostsByCategory, postPath, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { themeFor } from "@/lib/magazine-themes";
import { ArrowIcon } from "@/components/ab-icons";
import { PostCard, ThemeIconView } from "@/components/ab-magazine/post-card";
import { CtaBand } from "@/components/ab-city/city-parts";
import "@/components/ab-magazine/ab-magazine.css";

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

const AUTHOR_IMAGE = "https://ab50.de/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png";

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    getPostsByCategory(slug, 24),
    getCategories(50),
  ]);
  if (!category) notFound();

  const theme = themeFor(category.slug);
  const relatedCategories = allCategories.filter((item) => item.slug !== category.slug);
  const [featured, ...rest] = category.posts;

  return (
    <article className="abg">
      <header className={`ab-hero abg-hero abg-hero-theme abg-tone-${theme.tone}`}>
        <div className="ab-wrap abg-hero-grid">
          <div>
            <nav className="ab-crumbs" aria-label="Brotkrumen">
              <a href="/magazin/">50plus Magazin</a>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{category.name}</span>
            </nav>
            <span className="ab-badge"><ThemeIconView icon={theme.icon} />Themenwelt</span>
            <h1>{category.name}</h1>
            <p className="ab-lead">{category.description || `Alle Beiträge aus dem 50plus Magazin zum Thema ${category.name}.`}</p>
            <ul className="ab-chips">
              <li><strong>{category.count ?? category.posts.length}</strong> Beiträge</li>
              <li>Für Singles ab 50</li>
            </ul>
          </div>
          {featured ? (
            <div className="abg-hero-feature">
              <span className="abg-hero-kicker">Meistgelesen in dieser Rubrik</span>
              <PostCard post={featured} categories={allCategories} large />
            </div>
          ) : null}
        </div>
      </header>

      <nav className="ab-wrap abg-themenav" aria-label="Kategorien">
        <a href="/magazin/">Alle Themen</a>
        {allCategories.map((item) => (
          <a key={item.slug} href={categoryPath(item.slug)} aria-current={item.slug === category.slug ? "page" : undefined}>{item.name}</a>
        ))}
      </nav>

      <section className="ab-wrap ab-section" aria-labelledby="abg-cat-title">
        <div className="ab-head">
          <p className="ab-eyebrow">Beiträge in dieser Rubrik</p>
          <h2 id="abg-cat-title">Alle Artikel zu {category.name}</h2>
        </div>
        <div className="abg-grid">
          {rest.map((post) => <PostCard key={post.slug} post={post} categories={allCategories} />)}
        </div>
        {!rest.length && featured ? <p className="abg-empty">Mehr Beiträge zu diesem Thema folgen bald. <a href={postPath(featured.slug)}>{stripHtml(featured.title)}</a></p> : null}
      </section>

      <section className="ab-wrap ab-section abg-author-band" aria-label="Autor">
        {/* eslint-disable-next-line @next/next/no-img-element -- Autorenfoto aus WordPress */}
        <img src={AUTHOR_IMAGE} alt="Christian M. Haas" width={140} height={172} loading="lazy" />
        <div>
          <p className="ab-eyebrow">Von Christian M. Haas</p>
          <h2>Warum diese Tipps wirklich helfen</h2>
          <p>Die Artikel in dieser Rubrik sind aus echten Fragen und Erfahrungen entstanden – damit du Antworten findest, die wirklich passen und umsetzbar sind.</p>
          <a className="ab-btn ab-btn-outline ab-btn-small" href="/magazin/christian-m-haas/">Mehr zum Autorenprofil <ArrowIcon /></a>
        </div>
      </section>

      {relatedCategories.length ? (
        <section className="ab-wrap ab-section" aria-labelledby="abg-more-title">
          <div className="ab-head">
            <p className="ab-eyebrow">Weitere Themen</p>
            <h2 id="abg-more-title">Vielleicht auch interessant für dich</h2>
          </div>
          <div className="abg-themes">
            {relatedCategories.map((item) => {
              const itemTheme = themeFor(item.slug);
              return (
                <a key={item.slug} className={`abg-theme abg-tone-${itemTheme.tone}`} href={categoryPath(item.slug)}>
                  <ThemeIconView icon={itemTheme.icon} />
                  <strong>{item.name}</strong>
                  <span>{item.description || `Praktische Tipps zum Thema ${item.name.toLowerCase()}.`}</span>
                  <em>Thema öffnen <ArrowIcon /></em>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="Mehr entdecken"
        title="Vom Lesen ins Kennenlernen"
        text="Wenn du lieber direkt aktiv werden willst, kannst du kostenlos starten oder weitere Themen in Ruhe durchstöbern."
        primary={{ label: "Kostenlos starten", href: siteConfig.links.registrationCommon }}
        secondary={{ label: "Zum Magazin", href: "/magazin/" }}
      />
    </article>
  );
}
