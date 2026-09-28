import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { marketPartnersuchePath, withSlashedPageLinks } from "@/lib/markets";
import { categoryPath, getAllPageSlugs, getAllPostSlugs, getLatestPosts, getPageBySlug, getPostBySlug, pagePath, postPath, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { formatUpdatedLabel } from "@/lib/format";
import { buildChristianBookProfileGraph } from "@/lib/christian-book-profile-schema";
import { staticAsset } from "@/lib/static-asset";
import { excerptText, themeFor } from "@/lib/magazine-themes";
import { ArrowIcon, BookIcon, CalendarIcon, ClockIcon, HeartIcon, PinIcon } from "@/components/ab-icons";
import { PostCard, ThemeIconView } from "@/components/ab-magazine/post-card";
import "@/components/ab-magazine/ab-magazine.css";

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
    .filter((label) => !/^artikel kurz anhören$/i.test(label))
    .slice(0, 10)
    .map((label) => {
      const base = slugifyHeading(label);
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      return { label, id: count ? `${base}-${count + 1}` : base };
    });
}

function addHeadingIds(html: string, tocItems: TocItem[]) {
  const byLabel = new Map(tocItems.map((item) => [item.label, item.id]));
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, inner) => {
    const id = byLabel.get(stripHtml(inner));
    if (!id || /\sid=/.test(attrs)) return match;
    byLabel.delete(stripHtml(inner));
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
    if (headingCount === 3) return `${inlineArticleCta()}${match}`;
    return match;
  });
}

function sanitizeContent(html?: string | null, tocItems: TocItem[] = [], withCta = true) {
  const cleaned = (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // Lazy-Load-Plugin aus WordPress: echte Quelle statt 1×1-Platzhalter
    .replace(/\ssrc="data:image\/[^"]*"/gi, "")
    .replace(/\sdata-srcset=/gi, " srcset=")
    .replace(/\sdata-sizes=/gi, " sizes=")
    .replace(/\sdata-src=/gi, " src=")
    .replace(/class=("|')([^"']*?)lazyload([^"']*?)(\1)/gi, 'class="$2$3"')
    .replace(/<img(?![^>]*loading=)/gi, '<img loading="lazy"')
    .replace(/<img(?![^>]*decoding=)/gi, '<img decoding="async"');

  const linked = addHeadingIds(withSlashedPageLinks(cleaned), tocItems);
  return withCta ? injectInlineCta(linked) : linked;
}

function estimateReadingTime(html?: string | null) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function getAuthorProfile(authorSlug?: string | null) {
  return authorSlug ? knownAuthorProfiles[authorSlug] || null : null;
}

function rotateRelated(posts: Awaited<ReturnType<typeof getLatestPosts>>, slug: string, count = 3) {
  const remaining = posts.filter((post) => post.slug !== slug);
  if (!remaining.length) return [];
  const hash = Array.from(slug).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const offset = hash % remaining.length;
  return [...remaining.slice(offset), ...remaining.slice(0, offset)].slice(0, count);
}

function Crumbs({ title, category }: { title: string; category?: { name: string; slug: string } | null }) {
  return (
    <nav className="ab-light-crumbs" aria-label="Breadcrumb">
      <a href="/magazin/">50plus Magazin</a>
      {category ? (
        <>
          <span aria-hidden="true">›</span>
          <a href={categoryPath(category.slug)}>{category.name}</a>
        </>
      ) : null}
      <span aria-hidden="true">›</span>
      <span aria-current="page">{title}</span>
    </nav>
  );
}

function RadarCta() {
  const partnersuche = marketPartnersuchePath("de");
  return (
    <section className="ab-wrap ab-section" aria-label="Kostenlos starten">
      <div className="abg-radar">
        <div>
          <p className="ab-eyebrow"><PinIcon />Umkreissuche</p>
          <h2>Lerne neue Menschen kennen – mit mehr Ruhe, Klarheit und echtem Interesse.</h2>
          <p>Starte kostenlos auf ab50.de und schau dich in deinem Tempo um, wer in deiner Nähe ebenfalls neu anfangen möchte.</p>
          <div className="ab-actions">
            <a className="ab-btn ab-btn-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
            <a className="ab-btn ab-btn-ghost" href={partnersuche.publicUrl}>Singles in deiner Stadt</a>
          </div>
        </div>
        <a className="abg-radar-card" href={siteConfig.links.registrationCommon} tabIndex={-1} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- statische SVG-Grafik */}
          <img src={staticAsset("/umkreissuche-radar.svg")} alt="" width={320} height={480} loading="lazy" decoding="async" />
        </a>
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
  const description = excerptText(post.excerpt || post.content, 160);
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
    const profileGraph = buildChristianBookProfileGraph({
      slug,
      christianSlug: "christian-m-haas",
      content: page.content || "",
      canonicalUrl: absoluteUrl(pagePath(page.slug)),
      profileName: title,
      profileDescription: stripHtml(page.content).slice(0, 160),
      profileImage: knownAuthorProfiles["christian-m-haas"].imageSrc,
      jobTitle: knownAuthorProfiles["christian-m-haas"].role,
      breadcrumbRootName: siteConfig.magazineName,
      breadcrumbRootUrl: absoluteUrl("/magazin/"),
    });
    const isAuthor = slug === "christian-m-haas";
    const pageToc = extractTocItems(page.content);
    return (
      <>
        {profileGraph ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(profileGraph) }} /> : null}
        <article className="abg abg-article">
          <header className="ab-light-hero abg-ahero">
            <div className="ab-wrap abg-ahero-inner">
              <Crumbs title={title} />
              <span className="abg-kind">{isAuthor ? "Autorenprofil" : "Ratgeber"}</span>
              <h1>{title}</h1>
            </div>
          </header>
          <div className={`ab-wrap abg-layout${pageToc.length >= 3 ? "" : " abg-layout-solo"}`}>
            <div className="abg-body">
              {isAuthor && knownAuthorProfiles["christian-m-haas"].imageSrc ? (
                <figure className="abg-author-portrait">
                  <Image src={knownAuthorProfiles["christian-m-haas"].imageSrc} alt="Christian M. Haas" width={243} height={300} priority />
                </figure>
              ) : null}
              <div className="article-content ab-rich abg-rich" dangerouslySetInnerHTML={{ __html: isAuthor ? sanitizeContent(page.content, pageToc, false).replace(/<img\b[^>]*Christian-M-Haas[^>]*>/i, "") : sanitizeContent(page.content, pageToc, false) }} />
            </div>
            {pageToc.length >= 3 ? (
              <aside className="abg-side">
                <nav className="abg-toc" aria-label="Inhaltsverzeichnis">
                  <span><BookIcon />Auf dieser Seite</span>
                  <ol>{pageToc.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
                </nav>
              </aside>
            ) : null}
          </div>
          <RadarCta />
        </article>
      </>
    );
  }

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const latestPosts = await getLatestPosts(12);
  const relatedPosts = rotateRelated(latestPosts, post.slug, 3);
  const tocItems = extractTocItems(post.content);
  const title = stripHtml(post.title);
  const lead = excerptText(post.excerpt || post.content, 260);
  const readingMinutes = estimateReadingTime(post.content);
  const updatedLabel = formatUpdatedLabel(post);
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
  const theme = themeFor(category?.slug);
  const initials = authorName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AB";
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
      <article className="abg abg-article">
        <header className={`ab-light-hero abg-ahero abg-tone-${theme.tone}`}>
          <div className="ab-wrap abg-ahero-inner">
            <Crumbs title={title} category={category} />
            {category ? <a className="abg-kind" href={categoryPath(category.slug)}><ThemeIconView icon={theme.icon} />{category.name}</a> : null}
            <h1>{title}</h1>
            {lead ? <p className="ab-light-lead">{lead}</p> : null}
            <div className="abg-meta">
              <span className="abg-meta-author">
                <span className="abg-avatar" aria-hidden="true">
                  {authorProfile?.imageSrc ? <Image src={authorProfile.imageSrc} alt="" width={48} height={48} /> : initials}
                </span>
                {authorHref ? <a href={authorHref}>{authorName}</a> : <strong>{authorName}</strong>}
              </span>
              {updatedLabel ? <span><CalendarIcon />{updatedLabel}</span> : null}
              <span><ClockIcon />{readingMinutes} Min. Lesezeit</span>
            </div>
          </div>
        </header>

        {post.featuredImage?.sourceUrl ? (
          <figure className="ab-wrap abg-figure">
            <Image
              src={post.featuredImage.sourceUrl}
              alt={post.featuredImage.altText || title}
              width={post.featuredImage.width || 1200}
              height={post.featuredImage.height || 700}
              priority
              sizes="(max-width: 1240px) 100vw, 1200px"
            />
          </figure>
        ) : null}

        <div className={`ab-wrap abg-layout${tocItems.length >= 3 ? "" : " abg-layout-solo"}`}>
          <div className="abg-body">
            {tocItems.length >= 3 ? (
              <details className="abg-toc-mobile">
                <summary><BookIcon />In diesem Beitrag</summary>
                <ol>{tocItems.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
              </details>
            ) : null}
            <div className="article-content ab-rich abg-rich" dangerouslySetInnerHTML={{ __html: safeHtml }} />

            <section className="abg-author" aria-label="Autor">
              <span className="abg-author-avatar" aria-hidden="true">
                {authorProfile?.imageSrc ? <Image src={authorProfile.imageSrc} alt="" width={96} height={118} /> : initials}
              </span>
              <div>
                <p className="ab-eyebrow">Verfasst von</p>
                <h2>{authorName}</h2>
                <p className="abg-author-role">{authorRole}</p>
                <p>{authorDescription}</p>
                {authorHref ? <a className="abg-author-link" href={authorHref}>Zum Autorenprofil <ArrowIcon /></a> : null}
              </div>
            </section>
          </div>

          {tocItems.length >= 3 ? (
            <aside className="abg-side">
              <nav className="abg-toc" aria-label="Inhaltsverzeichnis">
                <span><BookIcon />In diesem Beitrag</span>
                <ol>{tocItems.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
              </nav>
              <a className="abg-side-cta" href={siteConfig.links.registrationCommon}>
                <HeartIcon />
                <strong>Singles ab 50 in deiner Nähe</strong>
                <span>Kostenlos registrieren und in Ruhe schauen, wer zu dir passt.</span>
                <em>Jetzt starten <ArrowIcon /></em>
              </a>
            </aside>
          ) : null}
        </div>

        <RadarCta />

        {relatedPosts.length ? (
          <section className="ab-wrap ab-section" aria-labelledby="abg-related-title">
            <div className="abg-head-row">
              <div className="ab-head">
                <p className="ab-eyebrow"><HeartIcon />Weiterlesen</p>
                <h2 id="abg-related-title">Weitere Beiträge aus dem 50plus Magazin</h2>
              </div>
              <a className="ab-btn ab-btn-outline ab-btn-small" href="/magazin/">Alle Beiträge <ArrowIcon /></a>
            </div>
            <div className="abg-grid">
              {relatedPosts.map((item) => <PostCard key={item.slug} post={item} />)}
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
