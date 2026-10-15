/**
 * Aussagekräftigere H1 für Seiten, deren Titel als Überschrift zu kurz ist (Seobility „H1 zu kurz“, 2026-10-15).
 * Nur die sichtbare Überschrift ändert sich; Seitentitel, Linktexte und Breadcrumbs behalten den kurzen Namen.
 * Keyword bleibt vorn, Ansprache wie im jeweiligen Artikel.
 */
export const MAGAZINE_H1: Record<string, string> = {
  inhaltsverzeichnis: "Inhaltsverzeichnis des 50plus Magazins",
  "single-frauen-ab-50": "Single Frauen ab 50: So finden Sie eine glückliche Beziehung",
  "witwer-sucht-witwe": "Witwer sucht Witwe: Zu zweit in die zweite Lebenshälfte",
  "scheidung-im-alter": "Scheidung im Alter: Neuanfang nach der Trennung",
};

export const CATEGORY_H1: Record<string, string> = {
  "online-dating-ab-50": "Online-Dating ab 50: Tipps für den Einstieg",
  "beziehung-naehe": "Beziehung & Nähe: Partnerschaft ab 50",
};

export function magazineHeading(slug: string, title: string) {
  return MAGAZINE_H1[slug] ?? title;
}

export function categoryHeading(slug: string, name: string) {
  return CATEGORY_H1[slug] ?? name;
}
