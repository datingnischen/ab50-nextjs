import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { categoryPath, getAllPageSlugs, getAllPostSlugs, getLatestPosts, getPageBySlug, getPostBySlug, pagePath, postPath, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { formatGermanDate } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type TocItem = { id: string; label: string };

type KnownAuthorProfile = {
  imageSrc?: string;
  imageAlt?: string;
  role?: string;
  fallbackDescription?: string;
};

const knownAuthorProfiles: Record<string, KnownAuthorProfile> = {
  "christian-m-haas": {
    imageSrc: "https://ab50.de/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png",
    imageAlt: "Christian M. Haas",
    role: "Autor & Dating-Experte bei ab50.de",
    fallbackDescription:
      "Christian M. Haas schreibt über Online-Dating ab 50, Profilwirkung, Kommunikation, Sicherheit und neue Nähe in späteren Lebensphasen – ruhig, verständlich und praxisnah.",
  },
};

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

function inlineArticleCta() {
  return `
    <aside class="article-inline-cta" aria-label="ab50 Registrierung">
      <p class="eyebrow">ab50.de Tipp</p>
      <h2>Aus dem Lesen in den echten Kontakt</h2>
      <p>Wenn dich das Thema gerade bewegt, kannst du auf ab50.de kostenlos starten und in Ruhe neue Menschen kennenlernen.</p>
      <a class="button-primary" href="${siteConfig.links.registrationCommon}">Kostenlos starten</a>
    </aside>
  `;
}

function injectInlineCta(html: string) {
  let headingCount = 0;
  return html.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi, (match) => {
    headingCount += 1;
    if (headingCount === 2) return `${match}${inlineArticleCta()}`;
    return match;
  });
}

function sanitizeContent(html?: string | null, tocItems: TocItem[] = []) {
  const cleaned = (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy"')
    .replace(/<img(?![^>]*decoding=)/gi, '<img decoding="async"');

  return injectInlineCta(addHeadingIds(cleaned, tocItems));
}

function estimateReadingTime(html?: string | null) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function getAuthorProfile(authorSlug?: string | null) {
  return authorSlug ? knownAuthorProfiles[authorSlug] || null : null;
}

function rotateRelated(posts: Awaited<ReturnType<typeof getLatestPosts>>, slug: string, count = 4) {
  const remaining = posts.filter((post) => post.slug !== slug);
  if (!remaining.length) return [];
  const hash = Array.from(slug).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const offset = hash % remaining.length;
  return [...remaining.slice(offset), ...remaining.slice(0, offset)].slice(0, count);
}

function Breadcrumbs({ title }: { title: string }) {
  return (
    <nav className="article-breadcrumbs" aria-label="Breadcrumb">
      <a href="/magazin">50plus Magazin</a>
      <span aria-hidden="true">/</span>
      <span>{title}</span>
    </nav>
  );
}

function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <nav className="article-toc" aria-label="Inhaltsverzeichnis">
      <p className="eyebrow">In diesem Beitrag</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
        ))}
      </ol>
    </nav>
  );
}

function TakeawayBox({ description, items }: { description: string; items: TocItem[] }) {
  return (
    <section className="article-takeaway-box" aria-label="Kurz zusammengefasst">
      <p className="eyebrow">Kurz gesagt</p>
      <h2>Das Wichtigste auf einen Blick</h2>
      {description ? <p>{description}</p> : null}
      {items.length ? <ul>{items.slice(0, 3).map((item) => <li key={item.id}>{item.label}</li>)}</ul> : null}
    </section>
  );
}

function RelatedArticles({ posts }: { posts: Awaited<ReturnType<typeof getLatestPosts>> }) {
  if (!posts.length) return null;
  return (
    <section className="related-articles" aria-label="Weitere Artikel">
      <div className="section-heading compact-heading">
        <p className="eyebrow">Weiterlesen</p>
        <h2>Weitere Beiträge aus dem 50plus Magazin</h2>
      </div>
      <div className="related-article-grid">
        {posts.map((post) => (
          <a className="related-article-card" href={postPath(post.slug)} key={post.slug}>
            {post.featuredImage?.sourceUrl ? (
              <Image
                src={post.featuredImage.sourceUrl}
                alt={post.featuredImage.altText || stripHtml(post.title)}
                width={post.featuredImage.width || 700}
                height={post.featuredImage.height || 460}
                sizes="(max-width: 760px) 100vw, 25vw"
              />
            ) : <span className="related-card-placeholder" aria-hidden="true" />}
            <span>{formatGermanDate(post.date) || siteConfig.magazineName}</span>
            <strong>{stripHtml(post.title)}</strong>
          </a>
        ))}
      </div>
    </section>
  );
}

function FinalArticleCta() {
  return (
    <section className="article-final-cta" aria-label="Kostenlos starten">
      <p className="eyebrow">Bereit für den nächsten Schritt?</p>
      <h2>Lerne neue Menschen kennen – mit mehr Ruhe, Klarheit und echtem Interesse.</h2>
      <p>Starte kostenlos auf ab50.de und schau dich in deinem Tempo um.</p>
      <div className="article-final-actions">
        <a className="button-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
        <a className="button-secondary" href="/magazin">Weitere Themen lesen</a>
      </div>
    </section>
  );
}

export async function generateStaticParams() {
  const [postSlugs, pageSlugs] = await Promise.all([getAllPostSlugs(), getAllPageSlugs()]);
  return Array.from(new Set([...postSlugs, ...pageSlugs])).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (page) {
    const title = stripHtml(page.title);
    const description = stripHtml(page.content).slice(0, 160) || `${title} im 50plus Magazin von ab50.de.`;
    return {
      title,
      description,
      alternates: { canonical: pagePath(page.slug) },
      openGraph: {
        title,
        description,
        url: absoluteUrl(pagePath(page.slug)),
        type: "article",
        locale: "de_DE",
        siteName: siteConfig.name,
      },
    };
  }

  const post = await getPostBySlug(slug);
  if (!post) return {};
  const title = stripHtml(post.title);
  const description = stripHtml(post.excerpt || post.content).slice(0, 170);
  return {
    title,
    description,
    alternates: { canonical: postPath(post.slug) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(postPath(post.slug)),
      type: "article",
      locale: "de_DE",
      siteName: siteConfig.name,
      images: post.featuredImage?.sourceUrl ? [{ url: post.featuredImage.sourceUrl, alt: post.featuredImage.altText || title }] : undefined,
    },
  };
}

export default async function MagazinSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const page = await getPageBySlug(slug);
  if (page) {
    const title = stripHtml(page.title);
    return (
      <article className="container article-page generic-magazine-page">
        <header className="article-hero generic-page-hero">
          <Breadcrumbs title={title} />
          <p className="eyebrow">Sonderseite</p>
          <h1>{title}</h1>
        </header>
        <section className="article-body-grid single-column-layout">
          <div className="article-content-card">
            <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(page.content) }} />
          </div>
        </section>
      </article>
    );
  }

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const latestPosts = await getLatestPosts(12);
  const relatedPosts = rotateRelated(latestPosts, post.slug, 4);
  const tocItems = extractTocItems(post.content);
  const title = stripHtml(post.title);
  const lead = stripHtml(post.excerpt || post.content).slice(0, 220);
  const readingMinutes = estimateReadingTime(post.content);
  const safeHtml = sanitizeContent(post.content, tocItems);
  const authorName = post.author?.name || "ab50.de Redaktion";
  const authorSlug = post.author?.slug || "redaktion";
  const authorProfile = getAuthorProfile(authorSlug);
  const authorPage = authorSlug ? await getPageBySlug(authorSlug) : null;
  const authorHref = authorPage?.slug ? pagePath(authorPage.slug) : null;
  const authorRole = authorProfile?.role || "Autor bei ab50.de";
  const authorDescription = post.author?.description
    ? stripHtml(post.author.description)
    : (authorProfile?.fallbackDescription || "Die ab50.de Redaktion schreibt über Dating ab 50, Nähe, Lebensphasen, Sicherheit und neue Kontakte – ruhig, verständlich und alltagsnah.");
  const category = post.categories?.[0];
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: lead,
    datePublished: post.date,
    dateModified: post.modified,
    author: {
      "@type": "Person",
      name: authorName,
      url: authorHref ? absoluteUrl(authorHref) : undefined,
      image: authorProfile?.imageSrc,
    },
    articleSection: category?.name,
    image: post.featuredImage?.sourceUrl,
    mainEntityOfPage: absoluteUrl(postPath(post.slug)),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <article className="container article-page magazine-article-page">
        <header className="article-hero">
          <Breadcrumbs title={title} />
          {category ? <a className="article-category-chip" href={categoryPath(category.slug)}>{category.name}</a> : null}
          <h1>{title}</h1>
          {lead ? <p className="article-lead">{lead}</p> : null}
          {post.featuredImage?.sourceUrl ? (
            <Image
              src={post.featuredImage.sourceUrl}
              alt={post.featuredImage.altText || title}
              width={post.featuredImage.width || 1200}
              height={post.featuredImage.height || 700}
              className="article-hero-image"
              priority
              sizes="(max-width: 760px) 100vw, (max-width: 1180px) 90vw, 1020px"
            />
          ) : null}
          <div className="article-byline">
            <div className="article-byline-author">
              <span className="article-byline-avatar" aria-hidden="true">
                {authorProfile?.imageSrc ? (
                  <Image
                    src={authorProfile.imageSrc}
                    alt={authorProfile.imageAlt || authorName}
                    width={54}
                    height={54}
                  />
                ) : (
                  authorName.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]?.toUpperCase()).join("") || "AB"
                )}
              </span>
              <span>
                {authorHref ? <a className="article-author-link" href={authorHref}><strong>{authorName}</strong></a> : <strong>{authorName}</strong>}
                <em>{authorRole}</em>
              </span>
            </div>
            <div className="article-byline-facts">
              {post.date ? <span>Veröffentlicht: {formatGermanDate(post.date)}</span> : null}
              {post.modified && post.modified !== post.date ? <span>Aktualisiert: {formatGermanDate(post.modified)}</span> : null}
              <span>{readingMinutes} Min. Lesezeit</span>
            </div>
          </div>
        </header>

        <section className="article-body-grid">
          <aside className="article-side-column">
            <TableOfContents items={tocItems} />
          </aside>
          <div className="article-main-column">
            <TakeawayBox description={lead} items={tocItems} />
            <div className="article-content-card">
              <div className="article-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />
            </div>
            <section className="magazine-author-box" aria-label="Autor">
              <div className="magazine-author-avatar" aria-hidden="true">
                {authorProfile?.imageSrc ? (
                  <Image
                    src={authorProfile.imageSrc}
                    alt={authorProfile.imageAlt || authorName}
                    width={96}
                    height={96}
                  />
                ) : (
                  authorName.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]?.toUpperCase()).join("") || "AB"
                )}
              </div>
              <div>
                <p className="eyebrow">Verfasst von</p>
                <h2>{authorName}</h2>
                <p className="magazine-author-role">{authorRole}</p>
                <p>{authorDescription}</p>
                <div className="magazine-author-meta">
                  {post.date ? <span>Veröffentlicht am {formatGermanDate(post.date)}</span> : null}
                  {authorHref ? <span>Autorenprofil verfügbar</span> : null}
                </div>
                {authorHref ? <a className="button-secondary magazine-author-link" href={authorHref}>Zum Autorenprofil</a> : null}
              </div>
            </section>
            <RelatedArticles posts={relatedPosts} />
            <FinalArticleCta />
          </div>
        </section>
      </article>
    </>
  );
}
