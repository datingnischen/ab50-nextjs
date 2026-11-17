# Codex-Auftrag: Infografik „Online-Dating ab 50“ für den Gastartikel auf dating-foto.ch

Angelegt am 17. November 2026 von Claude. Trello: Karte „Codex: Infografik Online-Dating ab 50 (Gastartikel dating-foto.ch)“ im Board „Christian Aufgaben“, Liste „in Bearbeitung“.

## Hintergrund

Für Bruno von dating-foto.ch (Fotograf für Dating-Profilbilder, Schweiz) schreiben wir den Gastartikel „Online-Dating ab 50: Warum das Profilbild jetzt mehr zählt als mit 30“. Bruno veröffentlicht ihn auf seiner Seite, mit einem Link auf ab50.ch. Die Grafik wird **nicht** auf ab50.ch eingebunden. Sie geht als Datei zusammen mit der Word-Datei an Bruno. Christian möchte, dass ab50.ch als Urheber der Grafik sichtbar ist.

- Repo: `datingnischen/ab50-nextjs` (lokal `ab50-nextjs`), Branch `main`
- Artikeltext: `docs/gastartikel-dating-foto/artikel.md`. Die Grafik gehört an die Markierung `*[Infografik: Online-Dating ab 50 – wer es schon ausprobiert hat]*` im Abschnitt „Was die Zahlen über Online-Dating ab 50 sagen“.
- Farben aus dem ab50-Logo (`app/ab-base.css`): Blau `#1c4e95`, Nachtblau `#0b2146`, Rot `#ad1d1d`, Hellblau `#e8eff9`, Creme `#faf7f2`
- Schweizer Schreibweise: „ss“ statt „ß“ in allen Beschriftungen
- Keine Logos oder Markenzeichen Dritter (kein Pew-Logo). Ein ab50-Logo ist nicht nötig, der Text „Grafik: ab50.ch“ genügt.

## Dateien

- `docs/gastartikel-dating-foto/infografik-online-dating-ab-50.png`, 1200 px breit, Höhe nach Bedarf (etwa 900 bis 1100 px), für die Word-Datei
- `docs/gastartikel-dating-foto/infografik-online-dating-ab-50.webp`, gleiche Masse, höchstens etwa 200 KB, für Brunos Webseite
- Mobil lesbar: grosse Zahlen, wenig Text, deutsche Beschriftung

## Inhalt (nur diese Zahlen, alle aus der Quelle unten)

Titel: „Online-Dating ab 50: Wer hat es schon ausprobiert?“
Untertitel: „Anteil, der schon einmal eine Dating-Seite oder App genutzt hat“

Balkendiagramm (horizontal, Balken proportional zum Wert):

| Altersgruppe | schon einmal genutzt |
| --- | --- |
| 50 bis 59 Jahre | 23 % |
| 60 bis 69 Jahre | 14 % |
| 70 Jahre und älter | 12 % |
| alle ab 50 | 17 % |

Dazu zwei Kennzahl-Kacheln:

- „3 %“ – „der Menschen ab 50 haben Online-Dating im letzten Jahr genutzt (unter 50: 15 %)“
- „rund 1 von 2“ – „aktiven Nutzern ab 50 sucht eine feste Partnerschaft oder Ehe“

Fusszeile klein, mit Abstand:
„Quelle: Pew Research Center, Befragung von 6.034 Erwachsenen in den USA, Juli 2022 (veröffentlicht 2023) · Grafik: ab50.ch“

Alt-Text (für die Word-Datei und Brunos Seite):
„Infografik: Nur 17 Prozent der Menschen ab 50 haben schon einmal Online-Dating genutzt, bei den 50- bis 59-Jährigen 23 Prozent, ab 70 noch 12 Prozent. Im letzten Jahr aktiv waren nur 3 Prozent. Quelle: Pew Research Center, Grafik: ab50.ch“

Quelle: https://www.pewresearch.org/short-reads/2023/07/17/dating-at-50-and-up-older-americans-experiences-with-online-dating/

## Abschluss

Nur die zwei Bilddateien und diesen Auftrag committen. Im Arbeitsordner liegen fremde, nicht versionierte Ordner (`.claude/`, `output/`), die nicht mit committen. Git-Autor und -Committer ausschliesslich `christian@datingnischen.de` (vorher `git var GIT_AUTHOR_IDENT` und `git var GIT_COMMITTER_IDENT` prüfen). Auf `main` pushen. Es gibt keine Prüf-URL, weil die Grafik nicht auf ab50.ch erscheint. Die Grafik in der Trello-Karte als Anhang oder Link zeigen und das Ergebnis als Kommentar melden. Claude baut danach die Word-Datei mit Grafik und schickt sie nach Christians Freigabe an Bruno.
