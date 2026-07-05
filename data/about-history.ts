export type HistorySnapshot = {
  year: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  sourceUrl: string;
  sourceLabel: string;
};

export const ab50HistorySnapshots: HistorySnapshot[] = [
  {
    year: "2001",
    title: "Frühe Web-Phase mit sehr reduziertem Auftritt",
    description:
      "Der früheste auffindbare Snapshot zeigt noch keinen ausgebauten Dating-Auftritt, sondern eine sehr schlichte, fast leere Web-Ansicht. Gerade dieser Startpunkt macht sichtbar, wie weit sich ab50.de später in Richtung eigenständige Plattform und Marke entwickelt hat.",
    imageSrc: "/history/ab50-20010217133117.png",
    imageAlt: "Wayback-Snapshot von ab50.de aus dem Jahr 2001 mit sehr reduziertem, frühem Web-Auftritt.",
    sourceUrl: "https://web.archive.org/web/20010217133117id_/http://www.ab50.de/",
    sourceLabel: "Wayback Snapshot 2001 öffnen",
  },
  {
    year: "2013",
    title: "Zwischenphase mit geparkter Domain und Suchmaske",
    description:
      "2013 wirkt der Auftritt deutlich nüchterner und eher wie eine Domain- oder Platzhalter-Seite. Auch diese Phase gehört zur Geschichte, weil sie zeigt, dass Marke und Plattform nicht geradlinig, sondern über mehrere Entwicklungsstufen gewachsen sind.",
    imageSrc: "/history/ab50-2013-wayback-raw.png",
    imageAlt: "Wayback-Snapshot von ab50.de aus dem Jahr 2013 mit geparkter Domain und schlichter Suchmaske.",
    sourceUrl: "https://web.archive.org/web/20130524212255id_/http://ab50.de/",
    sourceLabel: "Wayback Snapshot 2013 öffnen",
  },
  {
    year: "2024",
    title: "Moderne 50plus-Plattform mit Magazin, Trust und klaren Einstiegen",
    description:
      "Der spätere Snapshot zeigt bereits deutlich, wohin sich ab50.de entwickelt hat: eine ruhigere, vertrauensbetonte Plattform mit Magazin, Stadt-Einstiegen, Service-Modulen und klarerem Fokus auf Singles mit Lebenserfahrung.",
    imageSrc: "/history/ab50-20240414141455.png",
    imageAlt: "Wayback-Snapshot von ab50.de aus dem Jahr 2024 mit moderner Plattform-Struktur, Kartenmodulen und Magazin-Bereich.",
    sourceUrl: "https://web.archive.org/web/20240414141455id_/https://ab50.de/",
    sourceLabel: "Wayback Snapshot 2024 öffnen",
  },
];
