import { swissPartnersuche } from "@/lib/ch-partnersuche";
import { marketPartnersuchePath } from "@/lib/markets";
import { getAllSwissPostSlugs, swissPostUrl } from "@/lib/wordpress";

export async function GET() {
  // Nur eigene, indexierbare Schweizer Seiten: Partnersuche und Beiträge aus data/ch-magazin.json (keine Spiegelseiten).
  const swissPostSlugs = await getAllSwissPostSlugs();
  const urls = [
    marketPartnersuchePath("ch").publicUrl,
    ...swissPartnersuche.cities.map((city) => marketPartnersuchePath("ch", city.slug).publicUrl),
    ...swissPostSlugs.map((slug) => swissPostUrl(slug)),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
