import { MarketLink } from "@/components/market-link";
import type { MapPin } from "@/lib/city-geo";

/** Landesumriss mit allen Stadtseiten als Herz-Pins; jeder Pin verlinkt die Stadtseite. */
export function CountryMap({
  id,
  label,
  map,
  caption = "Stadt antippen und direkt loslegen",
  className = "",
}: {
  id: string;
  label: string;
  map: { width: number; height: number; path: string; pins: MapPin[]; labelSize: number };
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={`abm-map ${className}`}>
      <svg viewBox={`-20 -20 ${map.width + 40} ${map.height + 40}`} role="img" aria-label={label} style={{ ["--abm-label" as string]: `${map.labelSize}px` }}>
        <defs>
          <symbol id={`abm-heart-${id}`} viewBox="0 0 24 24">
            <path d="M12 21.2s-8.6-5.2-8.6-11.6A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 8.6 3.2c0 6.4-8.6 11.6-8.6 11.6Z" />
          </symbol>
          <pattern id={`abm-dots-${id}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="9" cy="9" r="1.7" className="abm-dot" />
          </pattern>
        </defs>
        <path className="abm-land" d={map.path} />
        <path d={map.path} fill={`url(#abm-dots-${id})`} />
        {map.pins.map((pin, index) => {
          const content = (
            <>
              <title>{`Singles ab 50 in ${pin.name}`}</title>
              <circle className="abm-pulse" cx={pin.x} cy={pin.y} r="17" style={{ animationDelay: `${(index % 7) * 0.4}s` }} />
              <circle className="abm-pin-dot" cx={pin.x} cy={pin.y} r="19" />
              <use href={`#abm-heart-${id}`} x={pin.x - 11} y={pin.y - 11} width="22" height="22" className="abm-pin-heart" />
              {pin.label ? <text x={pin.label.x} y={pin.label.y} textAnchor={pin.label.anchor}>{pin.name}</text> : null}
            </>
          );
          return pin.previewHref ? (
            <MarketLink key={pin.key} className="abm-pin" href={pin.href} previewHref={pin.previewHref}>{content}</MarketLink>
          ) : (
            <a key={pin.key} className="abm-pin" href={pin.href}>{content}</a>
          );
        })}
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
