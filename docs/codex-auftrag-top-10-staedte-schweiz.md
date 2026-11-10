# Codex-Auftrag: Titelbild + Infografik „Die 10 besten Städte für Singles ab 50 in der Schweiz“ (ab50.ch)

Angelegt am 10. November 2026 von Claude. Trello: Karte „Codex: Titelbild + Infografik Top-10-Städte Schweiz ab50.ch“ (Board „Christian Aufgaben“, Liste „in Bearbeitung“), legt der Koordinator an.

- Repo: `datingnischen/ab50-nextjs` (lokal `ab50-nextjs`), Branch `main`
- Beitrag: einziger Eintrag in `data/ch-magazin.json` (id 2001, Slug `top-10-staedte-singles-ab-50-schweiz`). Der Beitrag gehört nur zu ab50.ch und steht bewusst **nicht** in `data/wp/posts.json`.
- Live-URL: https://ab50.ch/magazin/top-10-staedte-singles-ab-50-schweiz/
- Prüf-URL (Vercel, mit /ch-Präfix): https://ab50-nextjs.vercel.app/ch/magazin/top-10-staedte-singles-ab-50-schweiz/
- Farben aus dem Logo (`app/ab-base.css`): Blau `#1c4e95`, Nachtblau `#0b2146`, Rot `#ad1d1d`, Hellblau `#e8eff9`, Creme `#faf7f2`. Keine Logos, Wappen oder Markenzeichen Dritter.
- Schweizer Schreibweise: „ss“ statt „ß“ in allen Beschriftungen und Alt-Texten.
- Im Arbeitsordner liegen fremde, nicht versionierte Ordner (`.claude/`, `output/`). Nicht committen, nur eigene Dateien stagen.

## 1. Titelbild

- Datei: `public/magazin/media/top-10-staedte-singles-ab-50-schweiz.webp`, 1536 × 1024 px (wie die übrigen Beitragsbilder), WebP, höchstens etwa 200 KB
- Motiv: Zwei Menschen um die 60 spazieren entspannt an einer Seepromenade einer Schweizer Stadt, im Hintergrund Wasser, Altstadtfassaden und Berge. Warmes Nachmittagslicht, realistisch, kein Text, keine Logos. Keine bestimmte, eindeutig erkennbare Sehenswürdigkeit nötig.
- In `data/ch-magazin.json` beim Beitrag ergänzen (Format erhalten: `json.dumps(..., indent=1, ensure_ascii=False)`, CRLF-Zeilenenden, Zeilenumbruch am Ende):
  - `"featured_media": 2002`
  - `_embedded["wp:featuredmedia"] = [{"id": 2002, "source_url": "https://ab50.ch/magazin/media/top-10-staedte-singles-ab-50-schweiz.webp", "alt_text": "<Alt-Text passend zum Motiv>", "media_details": {"width": 1536, "height": 1024}}]`
- `source_url` mit **ab50.ch** (wird von `localizeUploadUrls` in `lib/wordpress.ts` auf den Asset-Host umgeschrieben). Der Test verbietet „ab50.de“ im Beitragstext.
- Kein Eintrag in `tests/wp-rest-compat.test.ts` ändern: Der Beitrag steht nicht im deutschen REST-Knoten.

## 2. Infografik „Flirt-Faktor: die Top 10 der Schweiz“ (Rangliste als Balkengrafik)

- Datei: `public/magazin/media/top-10-staedte-singles-ab-50-schweiz-infografik.webp`, 1200 px breit, Höhe nach Bedarf (etwa 1500 px), mobil lesbar (grosse Ziffern), deutsche Beschriftung
- Titel: „Die 10 besten Städte für Singles ab 50 in der Schweiz“, Untertitel: „Flirt-Faktor von ab50.ch, 0 bis 100 Punkte“
- Daten (nur diese Werte; Quelle `data/ch-city-facts.ts`, Feld `flirtFaktor`), horizontale Balken proportional zum Wert, absteigend:

| Platz | Stadt | Flirt-Faktor |
| --- | --- | --- |
| 1 | Zürich | 88 |
| 2 | Genf | 84 |
| 3 | Basel | 83 |
| 4 | Bern | 82 |
| 5 | Lausanne | 80 |
| 6 | Luzern | 78 |
| 7 | Winterthur | 76 |
| 8 | Lugano | 75 |
| 9 | St. Gallen | 74 |
| 9 | Biel/Bienne | 74 |

- Fusszeile klein: „Quelle: Flirt-Faktor der Stadtseiten von ab50.ch, redaktionelle Einschätzung (keine amtliche Statistik), Stand November 2026“
- Einbinden im HTML des Beitrags (`content.rendered` in `data/ch-magazin.json`) direkt nach der `</figure>` des HTML-Balkendiagramms und vor `<details class="mag-data">` (Abschnitt „Die Rangliste: Flirt-Faktor der Top 10“). Das HTML-Diagramm und die Tabelle bleiben erhalten:

```html
<figure class="mag-figure"><img src="https://ab50.ch/magazin/media/top-10-staedte-singles-ab-50-schweiz-infografik.webp" alt="Infografik: Zürich führt mit 88 von 100 Punkten beim Flirt-Faktor für Singles ab 50, vor Genf (84), Basel (83) und Bern (82); St. Gallen und Biel/Bienne teilen sich mit 74 Punkten Platz 9" width="1200" height="<Höhe>" loading="lazy" /></figure>
```

- Unter `<h2>Quellen</h2>` als weiteren Listenpunkt ergänzen: „Titelbild: KI-generiertes Symbolbild. Infografik: eigene Darstellung nach dem Flirt-Faktor von ab50.ch.“

## Prüfen, committen, pushen

```bash
npm test
npx tsc --noEmit
npm run build
```

`tests/ch-magazin.test.ts` prüft Rangliste, Werte, Treffpunkte und Links gegen `data/ch-city-facts.ts`; er muss grün bleiben. Git-Autor und -Committer ausschliesslich `christian@datingnischen.de` (vorher `git var GIT_AUTHOR_IDENT` und `git var GIT_COMMITTER_IDENT` prüfen). Auf `main` pushen, auf der Prüf-URL und live auf ab50.ch kontrollieren (Titelbild lädt, Infografik sichtbar, Karte in ab50.ch/magazin/ zeigt das Bild) und das Ergebnis als Kommentar in die Trello-Karte schreiben.
