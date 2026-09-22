import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.edge";
import { CityCharacterArt, type CityArtFileVariant } from "@/components/city-character-art";
import { getSwissCity, getSwissCitySlugs } from "@/lib/ch-partnersuche";

/**
 * Liefert die Stadtgrafiken als eigenstaendige SVG-Dateien aus, damit die
 * Uebersichtskacheln und die Vorschaubilder per `loading="lazy"` geladen und
 * ueber alle Stadtseiten hinweg gecacht werden koennen.
 *
 * Die Dateien werden beim Build vorgerendert; Quelle bleibt die React-Komponente,
 * es gibt also keine zweite Zeichenlogik, die auseinanderlaufen koennte.
 */

export const dynamic = "force-static";

const FILE_VARIANTS: CityArtFileVariant[] = ["card", "thumb"];
const FILE_PATTERN = /^(.+)-(card|thumb)\.svg$/;

export function generateStaticParams() {
  return getSwissCitySlugs().flatMap((slug) =>
    FILE_VARIANTS.map((variant) => ({ file: `${slug}-${variant}.svg` })),
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const match = FILE_PATTERN.exec(file);
  if (!match) return new Response("Not Found", { status: 404 });

  const [, slug, variant] = match;
  const city = getSwissCity(slug);
  if (!city) return new Response("Not Found", { status: 404 });

  const markup = renderToStaticMarkup(
    createElement(CityCharacterArt, {
      slug: city.slug,
      name: city.name,
      variant: variant as CityArtFileVariant,
      standalone: true,
    }),
  );

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n${markup}`, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // Bewusst nicht "immutable": die URL bleibt gleich, wenn eine Grafik
      // ueberarbeitet wird. Kurze Browser-Frist, lange CDN-Frist mit
      // Hintergrund-Revalidierung.
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
