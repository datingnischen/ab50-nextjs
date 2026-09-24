export function formatGermanDate(value?: string | null) {
  if (!value) return "";
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Sichtbares Artikeldatum: immer das Aenderungsdatum, Fallback auf das Veroeffentlichungsdatum. */
export function formatUpdatedLabel(post: { date?: string | null; modified?: string | null }) {
  const formatted = formatGermanDate(post.modified || post.date);
  return formatted ? `Aktualisiert am ${formatted}` : "";
}
