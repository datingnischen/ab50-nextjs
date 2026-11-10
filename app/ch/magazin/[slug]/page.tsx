import type { Metadata } from "next";
import MagazinSlugPage, { generateMetadata as baseMetadata, generateStaticParams as baseStaticParams } from "../../../magazin/[slug]/page";
import { getAllSwissPostSlugs, getSwissPostBySlug } from "@/lib/wordpress";
import { mirrorMetadata } from "@/lib/mirror-metadata";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * ab50.ch/magazin/<slug>/ (nginx reicht mit /ch-Präfix weiter):
 * - eigene Schweizer Beiträge (data/ch-magazin.json): indexierbar, Self-Canonical auf ab50.ch;
 * - alle übrigen Slugs: Spiegel der deutschen Seite, noindex statt Canonical auf ab50.de (lib/mirror-metadata.ts).
 */
export async function generateStaticParams() {
  const [swissSlugs, germanParams] = await Promise.all([getAllSwissPostSlugs(), baseStaticParams()]);
  return [...swissSlugs.map((slug) => ({ slug })), ...germanParams];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (await getSwissPostBySlug(slug)) return baseMetadata({ params: Promise.resolve({ slug, market: "ch" }) });
  return mirrorMetadata(await baseMetadata({ params }));
}

export default async function SwissMagazinSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (await getSwissPostBySlug(slug)) return MagazinSlugPage({ params: Promise.resolve({ slug, market: "ch" }) });
  return MagazinSlugPage({ params });
}
