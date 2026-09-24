import { searchUrl, type MarketCode } from "@/lib/markets";

export function CitySearchFallback({ market }: { market: MarketCode }) {
  return (
    <aside className="category-editorial-note city-search-fallback" aria-label="Individuelle Suche">
      <div>
        <p className="eyebrow">Individuelle Suche</p>
        <h2>Deine Stadt ist nicht dabei? Such einfach in deiner Umgebung.</h2>
        <p>Nicht jeder Ort hat eine eigene Stadtseite – Singles ab 50 gibt es trotzdem auch in deiner Region. In der individuellen Suche legst du Ort, Umkreis und Alter selbst fest und siehst, wer in deiner Nähe ebenfalls neue Kontakte sucht.</p>
      </div>
      <a className="button-primary" href={searchUrl(market)}>Zur individuellen Suche</a>
    </aside>
  );
}
