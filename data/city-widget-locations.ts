export type IconyWidgetLocation = {
  country: 49 | 43 | 41;
  zip?: string;
};

const cityWidgetLocations: Record<string, IconyWidgetLocation> = {
  aachen: { country: 49, zip: "52" },
  augsburg: { country: 49, zip: "86" },
  berlin: { country: 49, zip: "10,12,13,14" },
  bielefeld: { country: 49, zip: "33" },
  bochum: { country: 49, zip: "44" },
  bonn: { country: 49, zip: "53" },
  braunschweig: { country: 49, zip: "38" },
  bremen: { country: 49, zip: "28" },
  chemnitz: { country: 49, zip: "09" },
  dortmund: { country: 49, zip: "44" },
  dresden: { country: 49, zip: "01" },
  duisburg: { country: 49, zip: "47" },
  duesseldorf: { country: 49, zip: "40,41" },
  erfurt: { country: 49, zip: "99" },
  essen: { country: 49, zip: "45" },
  "frankfurt-am-main": { country: 49, zip: "60,65" },
  hamburg: { country: 49, zip: "20,21,22" },
  hannover: { country: 49, zip: "30" },
  heidelberg: { country: 49, zip: "69" },
  karlsruhe: { country: 49, zip: "76" },
  kassel: { country: 49, zip: "34" },
  kiel: { country: 49, zip: "24" },
  koeln: { country: 49, zip: "50,51" },
  leipzig: { country: 49, zip: "04" },
  magdeburg: { country: 49, zip: "39" },
  mainz: { country: 49, zip: "55" },
  mannheim: { country: 49, zip: "68" },
  moenchengladbach: { country: 49, zip: "41" },
  muenchen: { country: 49, zip: "80,81" },
  muenster: { country: 49, zip: "48" },
  nuernberg: { country: 49, zip: "90,91" },
  oberhausen: { country: 49, zip: "46" },
  osnabrueck: { country: 49, zip: "49" },
  rostock: { country: 49, zip: "18" },
  stuttgart: { country: 49, zip: "70,71" },
  wien: { country: 43, zip: "10,11,12,13,14,15,16,17,18,19,20,21,22,23" },
  wiesbaden: { country: 49, zip: "65" },
  wuppertal: { country: 49, zip: "42" },
  jena: { country: 49, zip: "07" },
};

function normalizeLocationKey(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getIconyWidgetLocation(city: string): IconyWidgetLocation {
  return cityWidgetLocations[normalizeLocationKey(city)] || { country: 49 };
}
