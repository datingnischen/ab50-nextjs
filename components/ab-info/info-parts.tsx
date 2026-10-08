import type { ReactNode } from "react";
import { SearchIcon } from "@/components/ab-icons";
import { ABOUT_HISTORY_PATH, ABOUT_REVIEWS_PATH, ABOUT_ROOT_PATH, ABOUT_SOCIAL_PATH } from "@/lib/about-pages";
import { SITE_SEARCH_PATH } from "@/lib/site-search";
import "./ab-info.css";

const LINKS = [
  { href: ABOUT_ROOT_PATH, label: "Über ab50.de" },
  { href: ABOUT_HISTORY_PATH, label: "Geschichte" },
  { href: ABOUT_REVIEWS_PATH, label: "Bewertungen" },
  { href: ABOUT_SOCIAL_PATH, label: "Social Media" },
  { href: "/faq/", label: "FAQ" },
  { href: "/magazin/christian-m-haas/", label: "Christian M. Haas" },
  { href: SITE_SEARCH_PATH, label: "Suche" },
];

/** Unternavigation für den Über-uns-Bereich. */
export function AboutSubnav({ current }: { current: string }) {
  return (
    <nav className="ab-wrap abi-subnav" aria-label="Über uns">
      {LINKS.map((link) => (
        <a key={link.href} href={link.href} aria-current={link.href === current ? "page" : undefined}>
          {link.href === SITE_SEARCH_PATH ? <SearchIcon /> : null}{link.label}
        </a>
      ))}
    </nav>
  );
}

/** Heller Seitenkopf mit Brotkrumen, Eyebrow, H1, Lead und optionalem Bild rechts. */
export function LightHero({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  aside,
}: {
  crumbs: { label: string; href?: string }[];
  eyebrow: ReactNode;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="ab-light-hero abi-hero">
      <div className={`ab-wrap abi-hero-grid${aside ? "" : " abi-hero-solo"}`}>
        <div>
          <nav className="ab-light-crumbs" aria-label="Brotkrumen">
            {crumbs.map((crumb, index) => (
              <span key={crumb.label} style={{ display: "contents" }}>
                {index ? <span aria-hidden="true">›</span> : null}
                {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : <span aria-current="page">{crumb.label}</span>}
              </span>
            ))}
          </nav>
          <p className="ab-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {lead ? <div className="ab-light-lead">{lead}</div> : null}
          {children}
        </div>
        {aside}
      </div>
    </header>
  );
}
