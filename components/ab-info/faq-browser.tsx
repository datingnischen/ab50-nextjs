"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/ab-icons";

export type FaqItem = { question: string; answerHtml: string };
export type FaqSection = { id: string; title: string; introHtml?: string; outroHtml?: string; highlight?: boolean; items: FaqItem[] };

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&([aou])uml;/g, "$1e")
    .replace(/&szlig;/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ");
}

/** Durchsuchbare FAQ mit Themenleiste. Treffer werden automatisch aufgeklappt. */
export function FaqBrowser({ sections }: { sections: FaqSection[] }) {
  const [query, setQuery] = useState("");
  const terms = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);
  const filtered = useMemo(
    () => sections
      .map((section) => ({
        ...section,
        items: terms.length
          ? section.items.filter((item) => {
              const haystack = normalize(`${item.question} ${item.answerHtml}`);
              return terms.every((term) => haystack.includes(term));
            })
          : section.items,
      }))
      .filter((section) => section.items.length > 0),
    [sections, terms],
  );
  const total = filtered.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="abi-faq">
      <div className="ab-wrap abi-faq-tools">
        <label className="abi-faq-search">
          <SearchIcon />
          <span className="ab-sr">FAQ durchsuchen</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Frage suchen, z. B. Kosten oder kündigen" />
        </label>
        <p className="abi-faq-count" aria-live="polite">{terms.length ? `${total} Treffer` : `${sections.reduce((sum, s) => sum + s.items.length, 0)} Fragen in ${sections.length} Themen`}</p>
        <nav className="abi-faq-topics" aria-label="Themen">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>{section.title} <small>{section.items.length}</small></a>
          ))}
        </nav>
      </div>

      <div className="ab-wrap abi-faq-body">
        {filtered.length === 0 ? (
          <p className="abi-empty">Zu „{query}“ gibt es keine Antwort in der FAQ. Schreib uns über <a href="https://ab50.de/hilfe/">Hilfe &amp; Support</a>.</p>
        ) : null}
        {filtered.map((section) => (
          <section key={section.id} id={section.id} className={`abi-faq-card${section.highlight ? " abi-faq-card-dark" : ""}`} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.introHtml && !terms.length ? <div className="abi-faq-intro" dangerouslySetInnerHTML={{ __html: section.introHtml }} /> : null}
            {section.items.map((item) => (
              <details key={`${terms.join(" ")}|${item.question}`} open={terms.length > 0}>
                <summary>{item.question}</summary>
                <div className="abi-faq-answer" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
              </details>
            ))}
            {section.outroHtml && !terms.length ? <div className="abi-faq-intro" dangerouslySetInnerHTML={{ __html: section.outroHtml }} /> : null}
          </section>
        ))}
      </div>
    </div>
  );
}
