"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SearchIcon } from "@/components/ab-icons";

function normalize(value: string) {
  return value.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

/**
 * Städtesuche und Regionsfilter über bereits gerenderte Karten (data-city, data-region).
 * Ohne JavaScript bleiben alle Karten sichtbar.
 */
export function CityFilter({ regions, regionLabel, total, children }: { regions: string[]; regionLabel: string; total: number; children: ReactNode }) {
  const grid = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [visible, setVisible] = useState(total);

  useEffect(() => {
    const q = normalize(query.trim());
    let count = 0;
    grid.current?.querySelectorAll<HTMLElement>("[data-city]").forEach((card) => {
      const matches = (!region || card.dataset.region === region) && (!q || normalize(`${card.dataset.city} ${card.dataset.region}`).includes(q));
      card.hidden = !matches;
      if (matches) count += 1;
    });
    setVisible(count);
  }, [query, region]);

  return (
    <div className="abm-finder">
      <div className="abm-finder-bar">
        <label className="ab-search abm-search">
          <SearchIcon />
          <span className="ab-sr">Stadt suchen</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Stadt oder Region suchen …" autoComplete="off" />
        </label>
        <div className="abm-regions" role="group" aria-label={`Nach ${regionLabel} filtern`}>
          <button type="button" aria-pressed={region === null} onClick={() => setRegion(null)}>Alle</button>
          {regions.map((entry) => (
            <button type="button" key={entry} aria-pressed={region === entry} onClick={() => setRegion(region === entry ? null : entry)}>{entry}</button>
          ))}
        </div>
      </div>
      <p className="abm-count" aria-live="polite">{visible === total ? `${total} Stadtseiten` : `${visible} von ${total} Stadtseiten`}</p>
      <div ref={grid}>{children}</div>
      {visible === 0 ? <p className="abm-empty">Keine Stadtseite gefunden – probier die individuelle Suche direkt darunter.</p> : null}
    </div>
  );
}
