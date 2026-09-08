import { markets, type MarketCode } from "./markets.ts";

type CitySearchPostcode = {
  postcode: string;
  locality: string;
};

// Central city postcodes validated against OpenPLZ locality records:
// https://openplzapi.org/de/Localities and https://openplzapi.org/ch/Localities.
// These are intentionally separate from the broad prefix filters used by the
// profile widget in data/city-widget-locations.ts.
export const citySearchPostcodes = {
  de: {
    "singles-hannover": { postcode: "30159", locality: "Hannover" },
    "singles-berlin": { postcode: "10117", locality: "Berlin" },
    "singles-koeln": { postcode: "50667", locality: "Köln" },
    "singles-hamburg": { postcode: "20095", locality: "Hamburg" },
    "singles-frankfurt-am-main": { postcode: "60311", locality: "Frankfurt am Main" },
    "singles-muenchen": { postcode: "80331", locality: "München" },
    "singles-leipzig": { postcode: "04109", locality: "Leipzig" },
    "singles-kassel": { postcode: "34117", locality: "Kassel" },
    "rosenheim-singles": { postcode: "83022", locality: "Rosenheim" },
    "singles-freiburg": { postcode: "79098", locality: "Freiburg im Breisgau" },
    "singles-dortmund": { postcode: "44135", locality: "Dortmund" },
    "singles-duesseldorf": { postcode: "40213", locality: "Düsseldorf" },
    "singles-stuttgart": { postcode: "70173", locality: "Stuttgart" },
    "singles-dresden": { postcode: "01067", locality: "Dresden" },
    "singles-nuernberg": { postcode: "90402", locality: "Nürnberg" },
    "singles-bremen": { postcode: "28195", locality: "Bremen" },
    "singles-suhl": { postcode: "98527", locality: "Suhl" },
    "singles-jena": { postcode: "07743", locality: "Jena" },
  },
  ch: {
    zuerich: { postcode: "8001", locality: "Zürich" },
    genf: { postcode: "1204", locality: "Genève" },
    basel: { postcode: "4001", locality: "Basel" },
    bern: { postcode: "3011", locality: "Bern" },
    lausanne: { postcode: "1003", locality: "Lausanne" },
    winterthur: { postcode: "8400", locality: "Winterthur" },
    "st-gallen": { postcode: "9000", locality: "St. Gallen" },
    lugano: { postcode: "6900", locality: "Lugano" },
    fribourg: { postcode: "1700", locality: "Fribourg" },
    thun: { postcode: "3600", locality: "Thun" },
    koeniz: { postcode: "3098", locality: "Köniz" },
    "biel-bienne": { postcode: "2502", locality: "Biel/Bienne" },
    schaffhausen: { postcode: "8200", locality: "Schaffhausen" },
    "la-chaux-de-fonds": { postcode: "2300", locality: "La Chaux-de-Fonds" },
    luzern: { postcode: "6003", locality: "Luzern" },
    chur: { postcode: "7000", locality: "Chur" },
    zug: { postcode: "6300", locality: "Zug" },
    aarau: { postcode: "5000", locality: "Aarau" },
  },
} as const satisfies Record<MarketCode, Record<string, CitySearchPostcode>>;

function normalizeRouteSlug(routeSlug: string) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(routeSlug);
  } catch {
    throw new Error(`Invalid city route slug: ${routeSlug}`);
  }

  return decoded
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

export function getCitySearchPostcode(market: MarketCode, routeSlug: string) {
  const normalizedSlug = normalizeRouteSlug(routeSlug);
  const records = citySearchPostcodes[market] as Record<string, CitySearchPostcode>;
  const record = records[normalizedSlug];
  if (!record) throw new Error(`Missing central postcode for ${market}/${normalizedSlug}`);

  const expectedPattern = market === "de" ? /^\d{5}$/ : /^\d{4}$/;
  if (!expectedPattern.test(record.postcode)) {
    throw new Error(`Invalid central postcode for ${market}/${normalizedSlug}`);
  }
  return record.postcode;
}

export function citySearchUrl(market: MarketCode, routeSlug: string) {
  const postcode = getCitySearchPostcode(market, routeSlug);
  return `${markets[market].homeUrl}suche/?plz=${postcode}&AID=location`;
}
