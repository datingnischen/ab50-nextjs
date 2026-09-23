/**
 * Auswahl fuer den Block "Singles ab 50 in weiteren Städten" am Ende jeder
 * Stadtseite: Städte desselben Marktes, sortiert nach Pfad, beginnend direkt
 * nach der aktuellen Stadt (mit Umlauf). So verlinkt jede Stadtseite andere
 * Nachbarn statt immer dieselben ersten sechs. Städte mit Bild kommen zuerst.
 */
export type FurtherCityCandidate = {
  path: string;
  hasImage: boolean;
};

export function pickFurtherCities<T extends FurtherCityCandidate>(items: T[], currentPath: string, count = 6): T[] {
  const sorted = [...items].sort((a, b) => a.path.localeCompare(b.path, "de"));
  const currentIndex = sorted.findIndex((item) => item.path === currentPath);
  const rotated = currentIndex === -1
    ? sorted
    : [...sorted.slice(currentIndex + 1), ...sorted.slice(0, currentIndex)];
  const others = rotated.filter((item) => item.path !== currentPath);
  return [...others.filter((item) => item.hasImage), ...others.filter((item) => !item.hasImage)].slice(0, count);
}
