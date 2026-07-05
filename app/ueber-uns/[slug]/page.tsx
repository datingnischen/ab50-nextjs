import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutHistoryPage } from "@/components/about-history-page";
import { StandardContentPage } from "@/components/standard-content-page";
import { getStandardPage } from "@/data/standard-pages";
import { ABOUT_HISTORY_PATH, aboutPath, standardPageSlugFromAboutRoute } from "@/lib/about-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return [
    { slug: "geschichte" },
    { slug: "social-media" },
    { slug: "bewertungen" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "geschichte") {
    return {
      title: "Unsere Geschichte",
      description: "Wie sich ab50.de im Laufe der Jahre verändert hat – mit ausgewählten Wayback-Snapshots der Plattform.",
      alternates: { canonical: ABOUT_HISTORY_PATH },
    };
  }

  const standardSlug = standardPageSlugFromAboutRoute(slug);
  if (!standardSlug) return {};

  const page = getStandardPage(standardSlug);
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: { canonical: aboutPath(slug as "social-media" | "bewertungen") },
  };
}

export default async function UeberUnsSubpage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "geschichte") {
    return <AboutHistoryPage />;
  }

  const standardSlug = standardPageSlugFromAboutRoute(slug);
  if (!standardSlug) notFound();

  const page = getStandardPage(standardSlug);
  return <StandardContentPage page={page} />;
}
