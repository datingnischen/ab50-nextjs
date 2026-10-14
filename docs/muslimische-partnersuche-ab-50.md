# Muslimische Partnersuche ab 50 – Redaktion und Veröffentlichung

Aufgabe: https://trello.com/c/UBErdJ6M/1064-texte-zu-muslime-online-stellen

Neuer Beitrag: https://ab50.de/magazin/muslimische-partnersuche-ab-50/

Der Artikel ergänzt das bestehende dateibasierte Magazin. Schwerpunkt: konkrete Partnersuche in der Lebensphase ab 50, Glaubenspraxis ohne Pauschalisierungen, Verwitwung/Scheidung, Familie, Profilbeispiel, Gesprächsfragen und Schutz vor Liebesbetrug. Religiöse Bewertungen werden nicht vorgegeben. Redaktionelle Anregungen sind als solche eingeordnet. Die BAMF-Studie wird ausdrücklich nicht als Untersuchung zur Partnersuche ab 50 dargestellt.

Bereits veröffentlichte Beiträge aus derselben Karte:

- https://er-sucht-ihn.de/magazin/schwul-und-muslimisch-partnersuche/
- https://www.elflirt.de/magazin/muslimische-frauen-partnersuche/

Diese Bestandsartikel wurden gefunden und öffentlich verifiziert; in dieser Umsetzung nicht geändert.

## Quellen

- BAMF, Forschungsbericht 38, Muslimisches Leben in Deutschland 2020, veröffentlicht 2021: https://www.bamf.de/SharedDocs/Anlagen/DE/Forschung/Forschungsberichte/fb38-muslimisches-leben.html?nn=444666
- Polizeiliche Kriminalprävention, Romance Scamming: https://www.polizei-beratung.de/themen-und-tipps/sicher-handeln/onlinebetrug-maschen/romance-scamming-liebesbetrug/

## Titelbild

Datei: `public/magazin/editorial/muslimische-partnersuche-ab-50.webp`, 1536 × 1024 Pixel, etwa 177 kB. Mit dem eingebauten Imagegen-Werkzeug erzeugt, als WebP gespeichert. Fiktive Personen; Kennzeichnung im Quellenblock. Keine Darstellung tatsächlicher Mitglieder.

Finaler Prompt:

> Use case: photorealistic-natural. Asset type: editorial hero for a German article 'Muslimische Partnersuche ab 50'. Create a warm, refined natural horizontal photograph in 3:2 ratio. Two fictional adults around 58-65, a woman wearing a simple muted blue headscarf and contemporary cream cardigan, and a man with salt-and-pepper hair in an understated navy casual jacket, sitting across a small outdoor café table in a leafy German neighborhood, relaxed respectful conversation and subtle genuine smiles. Both are equally engaged. Realistic age, skin texture, hands, two cups of tea. Soft autumn daylight, restrained colors, candid framing, premium editorial photography. No religious monuments, no flags, no ornate costumes, no exaggerated romance, no text, no logos, no watermark. Keep faces centrally located for card crop. This is an illustrative fictional scene, not a real member testimonial.

## Prüfungen

- Unabhängige redaktionelle und technische Durchsicht: keine inhaltlichen Beanstandungen; Kategorieanzahl von 17 auf 18 korrigiert.
- `npm test`: 67 Node-Tests und zwei Python-Tests bestanden. Bestehende REST-Inventarerwartung auf 67 Beiträge aktualisiert.
- `npm run typecheck`: bestanden.
- `npm run build`: bestanden.
- `git diff --check`: bestanden.
- Alle drei internen Artikelziele vorhanden; eindeutige Beitrags-ID; Titel 58 und Beschreibung 142 Zeichen (ohne Seitentitel-Suffix).
- Browserkontrolle bei 390 und 1440 Pixeln: Titel, Canonical, Beschreibung und zugeklappte Quellen korrekt, kein horizontaler Überlauf. Screenshots visuell geprüft. Vor Deployment wurde das neue Titelbild für die lokale Browserkontrolle aus der Projektdatei geladen.
- `npm run lint` ist im Bestand nicht ausführbar: Das Skript verwendet `next lint`, das diese Next.js-Version nicht mehr bereitstellt. Kein Lint-Erfolg behauptet.

Veröffentlichung wird erst nach HTTP- und Bildprüfung des Vercel-Deployments als bestätigt dokumentiert.
