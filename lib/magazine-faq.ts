/**
 * FAQ-Bausteine im Beitrags-HTML (`<details class="mag-faq-item"><summary>Frage</summary>…</details>`,
 * gleiche Klassen wie bei dich-mit-stich) werden als FAQPage ausgezeichnet. Gestaltung: app/magazine-blocks.css.
 */
export type MagazineFaqItem = { question: string; answer: string };

const FAQ_ITEM = /<details\b[^>]*\bclass="[^"]*\bmag-faq-item\b[^"]*"[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;

function plainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractMagazineFaq(html?: string | null): MagazineFaqItem[] {
  return [...(html || "").matchAll(FAQ_ITEM)]
    .map(([, question, answer]) => ({ question: plainText(question), answer: plainText(answer) }))
    .filter((item) => item.question && item.answer);
}

export function buildMagazineFaqGraph(url: string, html?: string | null) {
  const faq = extractMagazineFaq(html);
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    inLanguage: "de-DE",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
