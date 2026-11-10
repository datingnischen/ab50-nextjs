import type { Metadata } from "next";
import { generateMetadata as baseMetadata } from "../../../../magazin/kategorie/[slug]/page";
import { mirrorMetadata } from "@/lib/mirror-metadata";

// ab50.ch-Spiegel der deutschen Seite: gleicher Inhalt, noindex statt Canonical auf ab50.de (lib/mirror-metadata.ts).
export { default, generateStaticParams } from "../../../../magazin/kategorie/[slug]/page";

export async function generateMetadata(props: Parameters<typeof baseMetadata>[0]): Promise<Metadata> {
  return mirrorMetadata(await baseMetadata(props));
}
