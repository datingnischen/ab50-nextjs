# Codex-Auftrag: Titelbild + Infografik „Living Apart Together ab 50“ (ab50.de)

Angelegt am 31. Oktober 2026 von Claude. Trello: Karte „Codex: Titelbild + Infografik Living Apart Together ab50.de“ (Board „Christian Aufgaben“, Liste „in Bearbeitung“).

- Repo: `datingnischen/ab50` (lokal `ab50-nextjs`), Branch `main`, Beitrag seit Commit `334f6d7`
- Beitrag: Eintrag `living-apart-together-ab-50` in `data/wp/posts.json` (id 1110), Prüf-URL https://ab50-nextjs.vercel.app/magazin/living-apart-together-ab-50/
- Farben aus dem Logo (`app/ab-base.css`): Blau `#1c4e95`, Nachtblau `#0b2146`, Rot `#ad1d1d`, Hellblau `#e8eff9`, Creme `#faf7f2`. Keine Logos oder Markenzeichen Dritter.
- Achtung: Im Arbeitsordner liegen fremde, nicht committete Änderungen (`app/magazin/[slug]/page.tsx`, `lib/site-entities.ts`, `tests/site-entities.test.ts`). Nicht mit committen, nur eigene Dateien stagen.

## 1. Titelbild

- Datei: `public/magazin/media/living-apart-together-ab-50.webp`, 1536 × 1024 px (wie die übrigen Beitragsbilder), WebP, höchstens etwa 200 KB
- Motiv: Ein Paar um die 60 verabschiedet sich herzlich an der Haustür eines Mehrfamilienhauses, eine Person mit Jacke und kleiner Reisetasche, die andere lehnt lächelnd im Türrahmen. Warmes Abendlicht, realistisch, kein Text, keine Logos.
- In `data/wp/posts.json` beim Beitrag ergänzen (Format der Datei erhalten: `json.dumps(..., indent=1, ensure_ascii=False)` + Zeilenumbruch am Ende):
  - `"featured_media": 1111`
  - `_embedded["wp:featuredmedia"] = [{"id": 1111, "source_url": "https://ab50.de/magazin/media/living-apart-together-ab-50.webp", "alt_text": "<Alt-Text passend zum Motiv>", "media_details": {"width": 1536, "height": 1024}}]`
- Erst damit erscheint der Beitrag auch im WP-REST-Knoten für die ICONY-Teaser (`lib/wp-rest-compat.ts` filtert Beiträge ohne Bild). Danach in `tests/wp-rest-compat.test.ts` `X-WP-Total` von `"67"` auf `"68"` setzen.

## 2. Infografik „Living Apart Together auf einen Blick“

- Datei: `public/magazin/media/living-apart-together-ab-50-infografik.webp`, 1200 px breit, Höhe nach Bedarf, mobil lesbar (große Ziffern), deutsche Beschriftung
- Inhalt (nur diese Zahlen):
  - 6 % der Menschen ab 43 leben in einer Partnerschaft mit zwei Haushalten
  - nach Alter: 43–55: 10 %, 56–65: 5 %, 66–75: 4 %, über 75: 2 %
  - Wunsch zusammenzuziehen: 43–65 Jahre 62 %, über 65 Jahre 20 %
  - Zusammenziehen wäre einfach oder gut möglich: 51 %, schwierig oder kaum möglich: 49 %
- Quelle klein unten: „Quelle: DZA Aktuell 02/2024, Deutscher Alterssurvey 2023 (n = 4.992)“
- Einbinden im HTML des Beitrags direkt nach der Box „Kurz gesagt“ (vor `<h2>Was bedeutet Living Apart Together?</h2>`):

```html
<figure class="mag-figure"><img src="https://ab50.de/magazin/media/living-apart-together-ab-50-infografik.webp" alt="Infografik: 6 Prozent der Menschen ab 43 leben in einer Partnerschaft mit zwei Haushalten, bei den 43- bis 55-Jährigen 10 Prozent; über 65 wünschen sich nur 20 Prozent ein Zusammenziehen" width="1200" height="<Höhe>" loading="lazy" /></figure>
```

- Unter `<h2>Quellen</h2>` ergänzen: „Titelbild: KI-generiertes Symbolbild. Infografik: eigene Darstellung nach DZA Aktuell 02/2024.“

## Prüfen, committen, pushen

```bash
npm test
```

Git-Autor und -Committer ausschließlich `christian@datingnischen.de`. Pushen, auf der Prüf-URL kontrollieren (Bild lädt, Infografik sichtbar) und das Ergebnis als Kommentar in die Trello-Karte schreiben.

## Umsetzung durch Codex – 3. November 2026

- Built-in ImageGen verwendet, beide Originale unter `$CODEX_HOME/generated_images/01a1a0fa-6e7b-7e20-8393-1439d1d3f870/` erhalten. WebP-Konvertierung mit Pillow.
- Titelbild: `public/magazin/media/living-apart-together-ab-50.webp`, 1536 × 1024, 181.480 Bytes; Infografik: `public/magazin/media/living-apart-together-ab-50-infografik.webp`, 1200 × 1600, 151.926 Bytes. Beide Motive und sämtliche Beschriftungen visuell geprüft.
- Quellenprüfung: Die ursprüngliche DZA-Veröffentlichung wurde zurückgezogen. Die korrigierte Fassung vom Juni 2025 bestätigt alle hier verwendeten gerundeten Zahlen: https://www.dza.de/fileadmin/dza/Dokumente/DZA_Aktuell/DZAAktuell_02_2024_Living-apart_together-vs2.pdf (S. 11–12, 16–18). Artikelquelle auf diese Fassung geändert. Gesamtstichprobe 4.992; Wunsch/Möglichkeit beruhen auf LAT-Teilstichproben, in der Grafik ausdrücklich gekennzeichnet.
- Featured Media 1111 ergänzt, Infografik nach „Kurz gesagt“, KI-Bildnachweis im automatisch zugeklappten Quellenbereich. Bestehende HTML-Diagramme und Datentabelle bleiben erhalten. WP-REST-Gesamtzahl nun 68.

### Finale ImageGen-Prompts

**Titelbild:** Use case: photorealistic-natural. Editorial hero photo for German relationship article Living Apart Together age 50+. Landscape 1536x1024. A loving couple around 60 saying a warm goodbye at the entrance of a modest elegant apartment building; one person wearing a jacket holding a small weekend travel bag outside, the other smiling in the doorframe. Natural affectionate gestures, plausible hands and faces, authentic mature people, warm evening light, tasteful real-life photography. No text, no logos, no watermark.

**Infografik:** Use case: infographic-diagram. Polished German editorial infographic, portrait approximately 1200x1600, large mobile-readable typography. Cream #faf7f2 background, navy #0b2146 typography, blue #1c4e95 and muted red #ad1d1d accents, pale blue cards #e8eff9, generous spacing. No logos. Title „Living Apart Together auf einen Blick“, subtitle „Zusammen sein, getrennt wohnen“. Big 6 % with label „der Menschen ab 43 leben in einer Partnerschaft mit zwei Haushalten“. Section „LAT nach Alter“: proportional bars 43–55 Jahre 10 %, 56–65 Jahre 5 %, 66–75 Jahre 4 %, Über 75 Jahre 2 %. Section „Wunsch zusammenzuziehen“: 43–65 Jahre 62 %, Über 65 Jahre 20 %, label „Menschen in LAT-Partnerschaften“. Section „Zusammenziehen in den nächsten drei Jahren“: 51 % „einfach oder gut möglich“, 49 % „schwierig oder kaum möglich“. Footer „Quelle: DZA Aktuell 02/2024 (korrigiert 2025), Deutscher Alterssurvey 2023 (n = 4.992)“. Note „Wunsch und Möglichkeit: Teilstichproben der LAT-Partnerschaften. Gerundete Werte.“ No extra numbers.

Prüfungen vor Veröffentlichung: `npm test` erfolgreich (2 Python-Tests und 113 Node-Tests); `npm run build` erfolgreich einschließlich TypeScript und 152 generierten Seiten; `git diff --check` ohne Fehler. Das vorhandene Lint-Skript `next lint` ist bei Next.js 16 kein unterstützter Prüfbefehl; deshalb Build/TypeScript als relevante Codeprüfung verwendet.
