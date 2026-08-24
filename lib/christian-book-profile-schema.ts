export type StructuredDataNode = Record<string, unknown>;

type ChristianBookProfileInput = {
  slug: string;
  christianSlug: string;
  content: string;
  canonicalUrl: string;
  profileName: string;
  profileDescription: string;
  profileImage?: string;
  jobTitle?: string;
  sameAs?: string[];
  knowsAbout?: string[];
  breadcrumbRootName: string;
  breadcrumbRootUrl: string;
};

const BOOK_MARKER_START = "<!-- dating-ohne-bullshit-book:start -->";
const BOOK_MARKER_END = "<!-- dating-ohne-bullshit-book:end -->";

function extractBoundedBookImage(content: string) {
  const starts = content.split(BOOK_MARKER_START).length - 1;
  const ends = content.split(BOOK_MARKER_END).length - 1;
  if (starts !== 1 || ends !== 1) return null;

  const start = content.indexOf(BOOK_MARKER_START) + BOOK_MARKER_START.length;
  const end = content.indexOf(BOOK_MARKER_END, start);
  if (end < start) return null;

  const markerBlock = content.slice(start, end);
  const imageMatch = markerBlock.match(/<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/i);
  if (!imageMatch) return null;

  try {
    const imageUrl = new URL(imageMatch[2].replace(/&amp;/gi, "&"));
    return imageUrl.protocol === "https:" || imageUrl.protocol === "http:" ? imageUrl.toString() : null;
  } catch {
    return null;
  }
}

export function buildChristianBookProfileGraph(input: ChristianBookProfileInput) {
  if (input.slug !== input.christianSlug) return null;
  const bookImage = extractBoundedBookImage(input.content);
  if (!bookImage) return null;

  const personId = `${input.canonicalUrl}#person`;
  const bookId = `${input.canonicalUrl}#book-9783696371210`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: input.breadcrumbRootName, item: input.breadcrumbRootUrl },
          { "@type": "ListItem", position: 2, name: input.profileName, item: input.canonicalUrl },
        ],
      },
      {
        "@type": "ProfilePage",
        "@id": `${input.canonicalUrl}#profile-page`,
        url: input.canonicalUrl,
        name: input.profileName,
        description: input.profileDescription,
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: input.profileName,
        description: input.profileDescription,
        url: input.canonicalUrl,
        image: input.profileImage,
        jobTitle: input.jobTitle,
        sameAs: input.sameAs,
        knowsAbout: input.knowsAbout,
      },
      {
        "@type": "Book",
        "@id": bookId,
        name: "Dating ohne Bullshit",
        alternateName: "Der ungeschönte Insiderblick ins Online-Dating-Business",
        author: { "@id": personId },
        isbn: "9783696371210",
        datePublished: "2026-08-21",
        inLanguage: "de-DE",
        bookFormat: "https://schema.org/Paperback",
        numberOfPages: 136,
        url: "https://www.amazon.de/dp/3696371211/",
        image: bookImage,
      },
    ],
  };
}
