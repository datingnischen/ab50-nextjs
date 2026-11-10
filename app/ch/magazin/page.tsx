import type { Metadata } from "next";
import MagazinOverviewPage, { metadata as baseMetadata } from "../../magazin/page";
import { SparkIcon } from "@/components/ab-icons";
import { PostCard } from "@/components/ab-magazine/post-card";
import { getSwissPosts } from "@/lib/wordpress";
import { mirrorMetadata } from "@/lib/mirror-metadata";
import "@/components/ab-magazine/ab-magazine.css";

// ab50.ch-Spiegel der deutschen Übersicht: gleicher Inhalt, noindex statt Canonical auf ab50.de (lib/mirror-metadata.ts).
// Eigene Schweizer Beiträge (data/ch-magazin.json) stehen oben, damit sie auf ab50.ch/magazin/ zuerst sichtbar sind.
export const metadata: Metadata = mirrorMetadata(baseMetadata);

export default async function SwissMagazinOverviewPage() {
  const swissPosts = await getSwissPosts();
  return (
    <>
      {swissPosts.length ? (
        <section className="ab-wrap ab-section" aria-labelledby="ch-magazin-title">
          <div className="ab-head">
            <p className="ab-eyebrow"><SparkIcon />Neu für die Schweiz</p>
            <h2 id="ch-magazin-title">Aus der Schweiz: Städte und Treffpunkte für Singles ab 50</h2>
          </div>
          <div className="abg-grid">
            {swissPosts.map((post) => <PostCard key={post.slug} post={post} />)}
          </div>
        </section>
      ) : null}
      <MagazinOverviewPage />
    </>
  );
}
