import { brandSameAs } from "@/data/standard-pages";
import { absoluteUrl, jsonLd } from "@/lib/seo";
import { buildSiteGraph, type SiteGraphPage } from "@/lib/site-entities";

export function SiteJsonLd({ page }: { page?: SiteGraphPage }) {
  const graph = buildSiteGraph({ siteRoot: absoluteUrl("/"), sameAs: brandSameAs(), page });
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(graph) }} />;
}
