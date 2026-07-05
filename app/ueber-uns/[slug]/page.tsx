import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StandardContentPage } from "@/components/standard-content-page";
import { getStandardPage } from "@/data/standard-pages";
import { aboutPath, standardPageSlugFromAboutRoute } from "@/lib/about-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return [
    { slug: "social-media" },
    { slug: "bewertungen" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
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
  const standardSlug = standardPageSlugFromAboutRoute(slug);
  if (!standardSlug) notFound();

  const page = getStandardPage(standardSlug);
  return <StandardContentPage page={page} />;
}
