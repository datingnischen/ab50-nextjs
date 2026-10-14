export const BRAND_NAME = "ab50.de";

export const PLATFORM_OPERATOR = {
  name: "ICONY GmbH",
  url: "https://www.icony.com",
} as const;

export type SiteGraphPage = {
  type: "WebPage" | "AboutPage" | "CollectionPage";
  url: string;
  name: string;
  description: string;
};

/** `siteRoot` is the absolute home URL with trailing slash, e.g. https://ab50.de/ */
export function siteEntityIds(siteRoot: string) {
  return {
    website: `${siteRoot}#website`,
    brand: `${siteRoot}#brand`,
    operator: `${siteRoot}#operator`,
  };
}

function websiteNode(siteRoot: string) {
  const ids = siteEntityIds(siteRoot);
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: siteRoot,
    name: BRAND_NAME,
    inLanguage: "de-DE",
    publisher: { "@id": ids.operator },
    about: { "@id": ids.brand },
  };
}

function operatorNode(siteRoot: string) {
  return {
    "@type": "Organization",
    "@id": siteEntityIds(siteRoot).operator,
    name: PLATFORM_OPERATOR.name,
    url: PLATFORM_OPERATOR.url,
  };
}

/** Operator, brand (with its own official profiles as `sameAs`) and website, optionally plus the current page. */
export function buildSiteGraph({ siteRoot, sameAs, page }: { siteRoot: string; sameAs: string[]; page?: SiteGraphPage }) {
  const ids = siteEntityIds(siteRoot);
  const graph: Record<string, unknown>[] = [
    operatorNode(siteRoot),
    {
      "@type": "Brand",
      "@id": ids.brand,
      name: BRAND_NAME,
      url: siteRoot,
      sameAs,
    },
    websiteNode(siteRoot),
  ];

  if (page) {
    graph.push({
      "@type": page.type,
      "@id": `${page.url}#webpage`,
      url: page.url,
      name: page.name,
      description: page.description,
      inLanguage: "de-DE",
      isPartOf: { "@id": ids.website },
      about: { "@id": ids.brand },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

const BERLIN_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** WordPress dates come without zone; the magazine is edited in Berlin. */
export function withBerlinOffset(date?: string | null) {
  if (!date) return undefined;
  if (/(Z|[+-]\d{2}:\d{2})$/.test(date)) return date;
  const wallAsUtc = Date.parse(`${date}Z`);
  if (Number.isNaN(wallAsUtc)) return undefined;
  const part = Object.fromEntries(BERLIN_CLOCK.formatToParts(new Date(wallAsUtc)).map((p) => [p.type, Number(p.value)]));
  const berlinWall = Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute, part.second);
  const offsetMinutes = Math.round((berlinWall - wallAsUtc) / 60000);
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  return `${date}${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

export type MagazineArticleGraphInput = {
  siteRoot: string;
  /** CMS pages get page and breadcrumb only, no BlogPosting. */
  kind?: "post" | "page";
  magazineName: string;
  magazineUrl: string;
  url: string;
  headline: string;
  description: string;
  image?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  /** A person with profile page, or the editorial team without one. */
  author?: { name: string; profileUrl?: string | null; image?: string };
  category?: { name: string; url: string } | null;
};

/** BlogPosting (posts) or plain WebPage (CMS pages) with breadcrumb, author, operator and the website, which points to the brand. */
export function buildMagazineArticleGraph(input: MagazineArticleGraphInput) {
  const ids = siteEntityIds(input.siteRoot);
  const pageId = `${input.url}#webpage`;
  const breadcrumbId = `${input.url}#breadcrumb`;
  const trail = [
    { name: "Startseite", url: input.siteRoot },
    { name: input.magazineName, url: input.magazineUrl },
    ...(input.category ? [input.category] : []),
    { name: input.headline, url: input.url },
  ];
  const isPost = (input.kind ?? "post") === "post";
  const author = !input.author
    ? undefined
    : input.author.profileUrl
    ? {
        "@type": "Person",
        "@id": `${input.author.profileUrl}#person`,
        name: input.author.name,
        url: input.author.profileUrl,
        image: input.author.image,
      }
    : { "@type": "Organization", name: input.author.name, url: input.siteRoot };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageId,
        url: input.url,
        name: input.headline,
        description: input.description,
        inLanguage: "de-DE",
        isPartOf: { "@id": ids.website },
        breadcrumb: { "@id": breadcrumbId },
        primaryImageOfPage: input.image ? { "@type": "ImageObject", url: input.image } : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
      isPost && {
        "@type": "BlogPosting",
        "@id": `${input.url}#article`,
        headline: input.headline,
        description: input.description,
        url: input.url,
        mainEntityOfPage: { "@id": pageId },
        isPartOf: { "@id": ids.website },
        inLanguage: "de-DE",
        image: input.image ? [input.image] : undefined,
        datePublished: withBerlinOffset(input.datePublished),
        dateModified: withBerlinOffset(input.dateModified ?? input.datePublished),
        articleSection: input.category?.name,
        author,
        publisher: { "@id": ids.operator },
      },
      websiteNode(input.siteRoot),
      operatorNode(input.siteRoot),
    ].filter(Boolean),
  };
}
