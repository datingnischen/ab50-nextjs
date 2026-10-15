import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { marketPartnersuchePath, withSlashedPageLinks } from "@/lib/markets";
import { categoryPath, cityPath, getAllCities, getAllPageSlugs, getAllPostSlugs, getCategories, getLatestPosts, getPageBySlug, getPostBySlug, pagePath, postPath, stripHtml, type WpCategory, type WpPostCard } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { formatUpdatedLabel } from "@/lib/format";
import { buildChristianBookProfileGraph } from "@/lib/christian-book-profile-schema";
import { buildMagazineArticleGraph } from "@/lib/site-entities";
import { staticAsset } from "@/lib/static-asset";
import { collapseSourceSections } from "@/lib/collapse-sources";
import { excerptText, themeFor } from "@/lib/magazine-themes";
import { seoTitle } from "@/lib/seo-title";
import { magazineHeading } from "@/lib/heading-overrides";
import { clampMetaDescription } from "@/lib/meta-description";
import { ArrowIcon, BookIcon, CalendarIcon, ClockIcon, HeartIcon, PinIcon, SparkIcon, UserIcon } from "@/components/ab-icons";
import { PostCard, ThemeIconView } from "@/components/ab-magazine/post-card";
import { TopicBanner } from "@/components/ab-magazine/topic-banner";
import { bannerForArticle } from "@/lib/magazine-banner";
import "@/components/ab-magazine/ab-magazine.css";
import "@/components/ab-magazine/author-profile.css";

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
    imageSrc: staticAsset("/magazin/wp-content/uploads/2025/09/Christian-M-Haas-Middle-243x300.png"),
    imageAlt: "Christian M. Haas",
    role: "Autor & Dating-Experte bei ab50.de",
    fallbackDescription:
      "Christian M. Haas schreibt über Online-Dating ab 50, Profilwirkung, Kommunikation, Sicherheit und neue Nähe in späteren Lebensphasen – ruhig, verständlich und praxisnah.",
  },
};

const CHRISTIAN_SLUG = "christian-m-haas";
const CHRISTIAN_META_DESCRIPTION =
  "Christian M. Haas betreibt seit 2008 Singlebörsen und schreibt im 50plus Magazin über Online-Dating ab 50, Profil, Sicherheit und Nähe.";
// Profile aus dem Abschnitt „Kontakt & Profile“ der Seite; zugleich sameAs im Person-Markup.
const CHRISTIAN_PROFILES = [
  { label: "Autorenseite bei Amazon", href: "https://www.amazon.com/author/christian-m-haas" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/christian-m-haas-457323379" },
  { label: "Profil auf Datingnischen.de", href: "https://datingnischen.de/christian/" },
];
const CHRISTIAN_KNOWS_ABOUT = ["Online-Dating ab 50", "Singlebörsen", "Dating-Profile und Anschreiben", "Scam-Prävention", "Sichere Dates"];
const CHRISTIAN_HERO_CITIES = [
  "singles-berlin",
  "singles-hamburg",
  "singles-muenchen",
  "singles-koeln",
  "singles-frankfurt-am-main",
  "singles-stuttgart",
  "singles-duesseldorf",
  "singles-leipzig",
  "singles-dresden",
  "singles-hannover",
  "singles-nuernberg",
  "singles-bremen",
];
// Angaben wie im CMS-Abschnitt und in lib/christian-book-profile-schema.ts
const CHRISTIAN_BOOK = {
  title: "Dating ohne Bullshit",
  subtitle: "Der ungeschönte Insiderblick ins Online-Dating-Business",
  amazonUrl: "https://www.amazon.de/dp/3696371211/",
  cover: staticAsset("/magazin/wp-content/uploads/2026/08/dating-ohne-bullshit-cover.jpg"),
  coverAlt: "Buchcover Dating ohne Bullshit von Christian M. Haas",
  text: "In seinem Buch berichtet Christian M. Haas offen über den Aufbau von Datingplattformen, unternehmerische Entscheidungen, Rückschläge und die Verantwortung hinter digitalen Begegnungen. Es ist kein klassischer Datingratgeber, sondern ein persönlicher Blick hinter die Kulissen des Online-Dating-Business.",
  facts: [
    { label: "Ausgabe", value: "Taschenbuch, 1. Auflage" },
    { label: "Umfang", value: "136 Seiten" },
    { label: "Erschienen", value: "21. August 2026" },
    { label: "ISBN", value: "978-3-6963-7121-0" },
  ],
};

/**
 * Christians Profiltext ohne die Teile, die das Autorenprofil selbst gestaltet: Porträt (Hero), Profil-Links (Hero)
 * und Buchblock (eigener Abschnitt). Im CMS-Buchblock lag der Button-Text in <strong>, das .ab-rich strong
 * dunkel färbte – dunkle Schrift auf dunklem Button.
 */
function christianProfileContent(html?: string | null) {
  return (html || "")
    .replace(/<img\b[^>]*Christian-M-Haas[^>]*>/i, "")
    .replace(/(?:<p>)?<!-- dating-ohne-bullshit-book:start -->(?:<\/p>)?[\s\S]*?<!-- dating-ohne-bullshit-book:end -->(?:<\/p>)?/, "")
    .replace(/(?:<p>)?<!-- dating-ohne-bullshit-schema:start -->[\s\S]*?<!-- dating-ohne-bullshit-schema:end -->(?:<\/p>)?/, "")
    .replace(/<section aria-label="Kontakt &amp; Profile">[\s\S]*?<\/section>/, "")
    .replace(/<section\b[^>]*>\s*<\/section>/g, "");
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
  // Quellen sind kein Kapitel: vor dem Inhaltsverzeichnis einklappen.
  const source = collapseSourceSections(html || "");
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
  const cleaned = collapseSourceSections(html || "")
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
          <img src={staticAsset("/umkreissuche-radar.svg")} alt="Umkreissuche: Singles ab 50 in deiner Nähe" width={320} height={480} loading="lazy" decoding="async" />
        </a>
      </div>
    </section>
  );
}

function AuthorPostCard({ post }: { post: WpPostCard }) {
  const category = post.categories?.[0];
  const theme = themeFor(category?.slug);
  const title = stripHtml(post.title);
  return (
    <article className={`abp-post abg-tone-${theme.tone}`}>
      <span className="abp-post-media">
        {post.featuredImage?.sourceUrl ? (
          <Image
            src={post.featuredImage.sourceUrl}
            alt={post.featuredImage.altText || title}
            width={post.featuredImage.width || 900}
            height={post.featuredImage.height || 600}
            sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
          />
        ) : <span className="abg-card-ph"><HeartIcon /></span>}
      </span>
      <span className="abp-post-body">
        {category ? <span className="abp-post-topic"><ThemeIconView icon={theme.icon} />{category.name}</span> : null}
        <h3><a href={postPath(post.slug)}>{title}</a></h3>
        <p>{excerptText(post.excerpt, 130)}</p>
      </span>
    </article>
  );
}

async function AuthorProfilePage({ title, contentHtml, tocItems }: { title: string; contentHtml: string; tocItems: TocItem[] }) {
  const profile = knownAuthorProfiles[CHRISTIAN_SLUG];
  const [allPosts, categories, cities] = await Promise.all([getLatestPosts(500), getCategories(), getAllCities()]);
  const ownPosts = allPosts.filter((post) => post.author?.slug === CHRISTIAN_SLUG);
  const latest = ownPosts.slice(0, 6);
  const topics = categories.filter((category: WpCategory) => (category.count ?? 0) > 0);
  const cityLinks = CHRISTIAN_HERO_CITIES
    .map((slug) => cities.find((city) => city.slug === slug))
    .filter((city): city is NonNullable<typeof city> => Boolean(city))
    .map((city) => ({ href: cityPath(city.slug), name: stripHtml(city.title).replace(/^Singles ab 50 aus\s+/i, "") }));
  const sideToc: TocItem[] = [
    ...tocItems,
    ...(latest.length ? [{ id: "neueste-beitraege", label: "Neueste Beiträge" }] : []),
    { id: "themen", label: "Themen und Städte" },
    { id: "buch", label: CHRISTIAN_BOOK.title },
  ];

  return (
    <article className="abg abg-article abp">
      <header className="ab-light-hero abp-hero">
        <div className="ab-wrap">
          <Crumbs title={title} />
          <div className="abp-hero-grid">
            {profile.imageSrc ? (
              <figure className="abp-portrait">
                <Image src={profile.imageSrc} alt={profile.imageAlt || title} width={243} height={300} priority />
              </figure>
            ) : null}
            <div className="abp-hero-copy">
              <span className="abg-kind"><UserIcon />Autorenprofil</span>
              <h1>{title}</h1>
              {profile.role && !title.includes("Dating-Experte") ? <p className="abp-role">{profile.role}</p> : null}
              <p className="abp-lead">{profile.fallbackDescription}</p>
              <ul className="abp-facts" aria-label="Kurz zu Christian M. Haas">
                <li><strong>seit 2008</strong><span>Aufbau und Betrieb seriöser Singlebörsen</span></li>
                <li><strong>seit 2016</strong><span>Partnerschaft mit Icony für Technik und Datenschutz</span></li>
                {ownPosts.length ? <li><strong>{ownPosts.length} Beiträge</strong><span>im 50plus Magazin von ab50.de</span></li> : null}
                <li><strong>Buch</strong><span><a href="#buch">„{CHRISTIAN_BOOK.title}“</a></span></li>
              </ul>
              <ul className="abp-profiles" aria-label="Profile von Christian M. Haas">
                {CHRISTIAN_PROFILES.map((item) => (
                  <li key={item.href}><a href={item.href} target="_blank" rel="noopener">{item.label}<ArrowIcon /></a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </header>

      <div className="ab-wrap abg-layout">
        <div className="abg-body">
          <div className="article-content ab-rich abg-rich" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
        <aside className="abg-side">
          <nav className="abg-toc" aria-label="Inhaltsverzeichnis">
            <span><BookIcon />Auf dieser Seite</span>
            <ol>{sideToc.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
          </nav>
        </aside>
      </div>

      {latest.length ? (
        <section className="ab-wrap ab-section abp-section" id="neueste-beitraege" aria-labelledby="neueste-beitraege-titel">
          <div className="abg-head-row">
            <div className="ab-head">
              <p className="ab-eyebrow"><SparkIcon />Aus dem Magazin</p>
              <h2 id="neueste-beitraege-titel">Neueste Beiträge von Christian M. Haas</h2>
            </div>
            <a className="abg-author-link" href="/magazin/">Alle Beiträge im Magazin <ArrowIcon /></a>
          </div>
          <div className="abp-posts">
            {latest.map((post) => <AuthorPostCard key={post.id} post={post} />)}
          </div>
        </section>
      ) : null}

      <section className="ab-wrap ab-section abp-section" id="themen" aria-labelledby="themen-titel">
        <div className="ab-head">
          <p className="ab-eyebrow"><HeartIcon />Schwerpunkte</p>
          <h2 id="themen-titel">Themen und Städte</h2>
          <p>Die Beiträge von Christian M. Haas ordnen sich in die Themenwelten des 50plus Magazins ein. Dazu kommen Stadtseiten für die Partnersuche ab 50.</p>
        </div>
        <div className="abp-topics">
          {topics.map((category) => {
            const theme = themeFor(category.slug);
            return (
              <article className={`abp-topic abg-tone-${theme.tone}`} key={category.slug}>
                <span className="abp-topic-icon" aria-hidden="true"><ThemeIconView icon={theme.icon} /></span>
                <h3><a href={categoryPath(category.slug)}>{category.name}</a></h3>
                {category.count ? <small>{category.count} {category.count === 1 ? "Beitrag" : "Beiträge"}</small> : null}
              </article>
            );
          })}
        </div>
        {cityLinks.length ? (
          <div className="abp-cities">
            <h3><PinIcon />Partnersuche ab 50 in deiner Stadt</h3>
            <ul>
              {cityLinks.map((city) => <li key={city.href}><a href={city.href}>Singles ab 50 in {city.name}</a></li>)}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="ab-wrap ab-section abp-section" id="buch" aria-labelledby="buch-titel">
        <div className="abp-book">
          <figure className="abp-book-cover">
            {/* eslint-disable-next-line @next/next/no-img-element -- Buchcover aus dem Upload-Bestand, Asset-Host */}
            <img src={CHRISTIAN_BOOK.cover} alt={CHRISTIAN_BOOK.coverAlt} width={1058} height={1500} loading="lazy" decoding="async" />
          </figure>
          <div className="abp-book-copy">
            <p className="ab-eyebrow"><BookIcon />Buch von Christian M. Haas</p>
            <h2 id="buch-titel">{CHRISTIAN_BOOK.title}</h2>
            <p className="abp-book-subtitle">{CHRISTIAN_BOOK.subtitle}</p>
            <p>{CHRISTIAN_BOOK.text}</p>
            <dl className="abp-book-facts">
              {CHRISTIAN_BOOK.facts.map((fact) => (
                <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
              ))}
            </dl>
            <div className="ab-actions">
              <a className="ab-btn ab-btn-blue abp-book-button" href={CHRISTIAN_BOOK.amazonUrl} target="_blank" rel="nofollow noopener noreferrer">„{CHRISTIAN_BOOK.title}“ bei Amazon ansehen <ArrowIcon /></a>
              <a className="ab-btn ab-btn-outline" href={CHRISTIAN_PROFILES[0].href} target="_blank" rel="noopener">Amazon-Autorenseite</a>
            </div>
          </div>
        </div>
      </section>

      <RadarCta />
    </article>
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
    const description = page.slug === CHRISTIAN_SLUG
      ? CHRISTIAN_META_DESCRIPTION
      : clampMetaDescription(stripHtml(page.content)) || `${title} im 50plus Magazin von ab50.de.`;
    return {
      title: seoTitle(title, page.slug),
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
  // Der WordPress-Auszug ist oft nur ein abgeschnittener Halbsatz; dann den Artikelanfang nehmen.
  const excerpt = clampMetaDescription(excerptText(post.excerpt, 400), 400);
  const description = clampMetaDescription(excerpt.length >= 120 ? excerpt : excerptText(post.content, 400));
  return {
    title: seoTitle(title, post.slug),
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
      profileDescription: CHRISTIAN_META_DESCRIPTION,
      profileImage: knownAuthorProfiles["christian-m-haas"].imageSrc,
      jobTitle: knownAuthorProfiles["christian-m-haas"].role,
      sameAs: CHRISTIAN_PROFILES.map((item) => item.href),
      knowsAbout: CHRISTIAN_KNOWS_ABOUT,
      breadcrumbRootName: siteConfig.magazineName,
      breadcrumbRootUrl: absoluteUrl("/magazin/"),
    });
    const isAuthor = slug === "christian-m-haas";
    // Christians Profil hat mit profileGraph sein eigenes Markup.
    const pageGraph = isAuthor
      ? null
      : buildMagazineArticleGraph({
          kind: "page",
          siteRoot: absoluteUrl("/"),
          magazineName: siteConfig.magazineName,
          magazineUrl: absoluteUrl("/magazin/"),
          url: absoluteUrl(pagePath(page.slug)),
          headline: title,
          description: stripHtml(page.content).slice(0, 160) || `${title} im 50plus Magazin von ab50.de.`,
        });
    if (isAuthor) {
      const authorContent = christianProfileContent(page.content);
      const authorToc = extractTocItems(authorContent);
      return (
        <>
          {profileGraph ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(profileGraph) }} /> : null}
          <AuthorProfilePage title={title} contentHtml={sanitizeContent(authorContent, authorToc, false)} tocItems={authorToc} />
        </>
      );
    }
    const pageToc = extractTocItems(page.content);
    return (
      <>
        {profileGraph ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(profileGraph) }} /> : null}
        {pageGraph ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(pageGraph) }} /> : null}
        <article className="abg abg-article">
          <header className="ab-light-hero abg-ahero">
            <div className="ab-wrap abg-ahero-inner">
              <Crumbs title={title} />
              <span className="abg-kind">{isAuthor ? "Autorenprofil" : "Ratgeber"}</span>
              <h1>{magazineHeading(page.slug, title)}</h1>
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
  const banner = bannerForArticle(post.slug, (post.categories || []).map((item) => item.slug));
  const theme = themeFor(category?.slug);
  const initials = authorName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AB";
  const schema = buildMagazineArticleGraph({
    siteRoot: absoluteUrl("/"),
    magazineName: siteConfig.magazineName,
    magazineUrl: absoluteUrl("/magazin/"),
    url: absoluteUrl(postPath(post.slug)),
    headline: title,
    description: lead,
    image: post.featuredImage?.sourceUrl || undefined,
    datePublished: post.date,
    dateModified: post.modified,
    // Als Person nur bekannte Autoren mit Profilseite, sonst die Redaktion als Organisation.
    author: {
      name: authorName,
      profileUrl: authorProfile && authorHref ? absoluteUrl(authorHref) : null,
      image: authorProfile?.imageSrc,
    },
    category: category ? { name: category.name, url: absoluteUrl(categoryPath(category.slug)) } : null,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <article className="abg abg-article">
        <header className={`ab-light-hero abg-ahero abg-tone-${theme.tone}`}>
          <div className="ab-wrap abg-ahero-inner">
            <Crumbs title={title} category={category} />
            {category ? <a className="abg-kind" href={categoryPath(category.slug)}><ThemeIconView icon={theme.icon} />{category.name}</a> : null}
            <h1>{magazineHeading(post.slug, title)}</h1>
            {lead ? <p className="ab-light-lead">{lead}</p> : null}
            <div className="abg-meta">
              <span className="abg-meta-author">
                <span className="abg-avatar" aria-hidden="true">
                  {authorProfile?.imageSrc ? <Image src={authorProfile.imageSrc} alt={authorName} width={48} height={48} /> : initials}
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
            {/* Inhaltsverzeichnis nur einmal im DOM (Seobility „doppelte Textblöcke“): das der Seitenleiste rückt mobil per CSS über den Artikel. */}
            <div className="article-content ab-rich abg-rich" dangerouslySetInnerHTML={{ __html: safeHtml }} />
            {/* Banner nur einmal im DOM (Seobility „doppelte Textblöcke“): mit Seitenleiste steht er dort, mobil rückt die Seitenleiste unter den Artikel. */}
            {tocItems.length >= 3 ? null : <TopicBanner banner={banner} placement="article" />}

            <section className="abg-author" aria-label="Autor">
              <span className="abg-author-avatar" aria-hidden="true">
                {authorProfile?.imageSrc ? <Image src={authorProfile.imageSrc} alt={authorName} width={96} height={118} /> : initials}
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
            <aside className="abg-side abg-side-article">
              <nav className="abg-toc" aria-label="Inhaltsverzeichnis">
                <span><BookIcon />In diesem Beitrag</span>
                <ol>{tocItems.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
              </nav>
              <TopicBanner banner={banner} placement="sidebar" />
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
