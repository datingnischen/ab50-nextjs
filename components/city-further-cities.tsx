import Image from "next/image";
import type { ReactNode } from "react";
import { MarketLink } from "@/components/market-link";

export type FurtherCityTile = {
  key: string;
  name: string;
  href: string;
  /** Nur CH: Vorschau-Route auf *.vercel.app (siehe MarketLink). */
  previewHref?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** Fertige SVG-Stadtgrafik: ohne next/image ausliefern. */
    unoptimized?: boolean;
  } | null;
};

type FurtherCitiesProps = {
  tiles: FurtherCityTile[];
  totalCities: number;
  overviewHref: string;
  overviewPreviewHref?: string;
};

function TileLink({ href, previewHref, className, ariaLabel, children }: {
  href: string;
  previewHref?: string;
  className: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  if (previewHref) {
    return <MarketLink className={className} href={href} previewHref={previewHref} ariaLabel={ariaLabel}>{children}</MarketLink>;
  }
  return <a className={className} href={href} aria-label={ariaLabel}>{children}</a>;
}

export function CityFurtherCities({ tiles, totalCities, overviewHref, overviewPreviewHref }: FurtherCitiesProps) {
  if (!tiles.length) return null;

  return (
    <section className="city-further" aria-labelledby="city-further-title">
      <div className="city-further-head">
        <div>
          <p className="eyebrow">Auch in deiner Nähe</p>
          <h2 id="city-further-title">Singles ab 50 in weiteren Städten</h2>
        </div>
        <TileLink className="city-further-all" href={overviewHref} previewHref={overviewPreviewHref}>
          Alle {totalCities} Städte <span aria-hidden="true">→</span>
        </TileLink>
      </div>
      <div className="city-further-grid">
        {tiles.map((tile) => (
          <TileLink className="city-further-tile" href={tile.href} previewHref={tile.previewHref} ariaLabel={`Singles ab 50 in ${tile.name}`} key={tile.key}>
            {tile.image ? (
              tile.image.unoptimized ? (
                // eslint-disable-next-line @next/next/no-img-element -- fertiges SVG, keine Optimierung noetig
                <img
                  src={tile.image.src}
                  alt={tile.image.alt}
                  width={tile.image.width}
                  height={tile.image.height}
                  loading="lazy"
                  decoding="async"
                  className="city-further-image"
                />
              ) : (
                <Image
                  src={tile.image.src}
                  alt={tile.image.alt}
                  width={tile.image.width}
                  height={tile.image.height}
                  loading="lazy"
                  className="city-further-image"
                  sizes="(max-width: 960px) 50vw, 380px"
                />
              )
            ) : (
              <span className="city-further-image city-further-placeholder" aria-hidden="true" />
            )}
            <span className="city-further-shade" aria-hidden="true" />
            <span className="city-further-label">
              <small>Singles in</small>
              <strong>{tile.name}</strong>
            </span>
            <span className="city-further-arrow" aria-hidden="true">→</span>
          </TileLink>
        ))}
      </div>
    </section>
  );
}
