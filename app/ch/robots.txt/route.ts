export function GET() {
  return new Response("User-agent: *\nAllow: /partnersuche\nSitemap: https://ab50.ch/sitemap.xml\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
