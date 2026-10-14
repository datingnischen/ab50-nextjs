import sitemap from "../../sitemap";

// Sitemap unter der alten WordPress-Adresse: ICONYs https://ab50.de/sitemap.php verweist auf /magazin/sitemap.xml,
// und nginx reicht auf der Live-Domain nur /magazin/… an Vercel durch (/sitemap.xml beantwortet ICONY mit 404).
export const revalidate = 3600;

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isoDate(value: string | Date | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export async function GET() {
  const entries = await sitemap();
  const body = entries
    .map((entry) => {
      const lastModified = isoDate(entry.lastModified);
      return ["  <url>", `    <loc>${escapeXml(entry.url)}</loc>`, lastModified ? `    <lastmod>${lastModified}</lastmod>` : "", "  </url>"]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
