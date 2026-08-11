"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { MarketLink } from "@/components/market-link";
import { markets, marketFromPathname, marketPartnersuchePath, marketPreviewPath, registrationUrl, type MarketCode } from "@/lib/markets";

function BrandLogo({ market, footer = false }: { market: MarketCode; footer?: boolean }) {
  const config = markets[market];
  return (
    <a className={`brand-lockup${footer ? " footer-brand-lockup" : ""}`} href={config.homeUrl} aria-label={`${config.siteName} Startseite`}>
      <Image
        src={config.logoSrc}
        alt={config.logoAlt}
        width={market === "ch" ? 180 : 180}
        height={market === "ch" ? 75 : 60}
        className="brand-logo-image"
        priority
      />
    </a>
  );
}

function externalAttrs(external?: boolean) {
  return external ? { target: "_blank", rel: "noopener" } : undefined;
}

type FooterLink = { label: string; href: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

const deFooterColumns: FooterColumn[] = [
  {
    title: "Über uns",
    links: [
      { label: "Über ab50.de", href: "/ueber-uns" },
      { label: "Geschichte", href: "/ueber-uns/geschichte" },
      { label: "Social Media", href: "/ueber-uns/social-media" },
      { label: "Bewertungen & Erfahrungen", href: "/ueber-uns/bewertungen" },
    ],
  },
  {
    title: "Magazin",
    links: [
      { label: "50plus Magazin", href: "/magazin" },
      { label: "Online-Dating ab 50", href: "/magazin/kategorie/online-dating-ab-50" },
      { label: "Beziehung & Nähe", href: "/magazin/kategorie/beziehung-naehe" },
      { label: "Sicherheit & Vertrauen", href: "/magazin/kategorie/sicherheit-vertrauen" },
    ],
  },
  {
    title: "Themen",
    links: [
      { label: "Leben & Neuanfang ab 50", href: "/magazin/kategorie/leben" },
      { label: "Profil & Kommunikation", href: "/magazin/kategorie/profil-kommunikation" },
      { label: "Singlebörsen & Vergleiche", href: "/magazin/kategorie/singleboersen-vergleiche" },
      { label: "Freizeit & Aktiv bleiben", href: "/magazin/kategorie/freizeit-aktiv-bleiben" },
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Regionale Partnersuche", href: "https://ab50.de/partnersuche" },
      { label: "Impressum", href: "https://ab50.de/impressum.html", external: true },
      { label: "Datenschutz", href: "https://ab50.de/datenschutz.html", external: true },
      { label: "AGB", href: "https://ab50.de/agb.html", external: true },
    ],
  },
];

const chFooterColumns: FooterColumn[] = [
  {
    title: "Partnersuche",
    links: [
      { label: "Schweizer Städte", href: "https://ab50.ch/partnersuche" },
      { label: "Singles in Zürich", href: "https://ab50.ch/partnersuche/zuerich" },
      { label: "Singles in Basel", href: "https://ab50.ch/partnersuche/basel" },
      { label: "Singles in Bern", href: "https://ab50.ch/partnersuche/bern" },
    ],
  },
  {
    title: "Dating-Tipps",
    links: [
      { label: "Dating-Tipps ab 50", href: "https://ab50.ch/dating-tipps/", external: true },
      { label: "Fragenflirt", href: "https://ab50.ch/fragenflirt.html", external: true },
      { label: "Fotoflirt", href: "https://ab50.ch/fotoflirt.html", external: true },
      { label: "Erfolgsgeschichten", href: "https://ab50.ch/unsere-erfolgsgeschichten.html", external: true },
    ],
  },
  {
    title: "Sicher kennenlernen",
    links: [
      { label: "Sicherheit & Datenschutz", href: "https://ab50.ch/sicherheit-und-datenschutz.html", external: true },
      { label: "Redaktionelle Kontrolle", href: "https://ab50.ch/redaktionelle-kontrolle.html", external: true },
      { label: "Kostenlose Basis-Mitgliedschaft", href: "https://ab50.ch/kostenlose-basis-mitgliedschaft.html", external: true },
      { label: "FAQ", href: "https://ab50.ch/faq/", external: true },
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Login", href: "https://ab50.ch/login/", external: true },
      { label: "Impressum", href: "https://ab50.ch/impressum.html", external: true },
      { label: "Datenschutz", href: "https://ab50.ch/datenschutz.html", external: true },
      { label: "AGB", href: "https://ab50.ch/agb.html", external: true },
    ],
  },
];

export function SiteHeader() {
  const pathname = usePathname();
  const market = marketFromPathname(pathname);
  const config = markets[market];
  const partnersuche = marketPartnersuchePath(market);

  return (
    <header className="site-header-shell">
      <div className="site-header-bar compact-header-bar">
        <BrandLogo market={market} />
        <div className="header-actions compact-header-actions" aria-label="Navigation und Aktionen">
          <a className="header-register header-register-primary" href={registrationUrl(market, pathname.includes("/partnersuche") ? "location" : "magazin")}>Kostenlos starten</a>
          <details className="header-menu">
            <summary aria-label="Menü öffnen">
              <span className="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
              <span className="header-menu-label">Menü</span>
            </summary>
            <div className="header-menu-panel">
              <nav className="main-nav compact-menu-nav" aria-label={`${config.siteName} Navigation`}>
                {market === "de" ? (
                  <>
                    <a href="/magazin">Magazin-Start</a>
                    <a href="/magazin/kategorie/online-dating-ab-50">Online-Dating ab 50</a>
                    <a href="/magazin/kategorie/beziehung-naehe">Beziehung & Nähe</a>
                    <a href="/magazin/kategorie/sicherheit-vertrauen">Sicherheit & Vertrauen</a>
                  </>
                ) : (
                  <>
                    <MarketLink href={partnersuche.publicUrl} previewHref={partnersuche.previewPath}>Regionale Partnersuche</MarketLink>
                    <a href="https://ab50.ch/dating-tipps/">Dating-Tipps</a>
                    <a href="https://ab50.ch/unsere-erfolgsgeschichten.html">Erfolgsgeschichten</a>
                  </>
                )}
                <a className="header-menu-supplement" href={config.homeUrl}>Zur {config.siteName} Startseite</a>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const market = marketFromPathname(pathname);
  const config = markets[market];
  const footerColumns = market === "ch" ? chFooterColumns : deFooterColumns;
  const countryCopy = market === "ch" ? "in der Schweiz" : "in Deutschland";

  return (
    <footer className="site-footer-shell">
      <section className="footer-cta" aria-label="Registrierung">
        <div>
          <p className="eyebrow">Dating ab 50 — entspannt und sicher</p>
          <h2>Treffe passende Singles {countryCopy} und starte neue Beziehungen.</h2>
          <p>Profil kostenlos anlegen, seriöse Kontakte entdecken und in deinem eigenen Tempo neue Menschen kennenlernen.</p>
        </div>
        <a className="footer-cta-button" href={registrationUrl(market, pathname.includes("/partnersuche") ? "location" : "magazin")}>Kostenlos starten</a>
      </section>

      <div className="footer-main">
        <div className="footer-brand-panel">
          <BrandLogo market={market} footer />
          <p>{market === "ch" ? "Die Partnersuche ab 50 für die Schweiz: regionale Seiten, sichere Kontakte und hilfreiche Dating-Tipps." : "Das 50plus Magazin: echte Tipps zu Dating ab 50, Sicherheit, Kommunikation und wie du neue Beziehungen aufbaust."}</p>
          <ul className="footer-trust-list" aria-label="Vertrauensmerkmale">
            <li>Profil kostenlos — kein Abo nötig zum Stöbern</li>
            <li>Sichere Nachrichtenbox und geprüfte Profile</li>
            <li>Regionale Einstiege für Singles ab 50</li>
          </ul>
        </div>

        <nav className="footer-link-grid" aria-label="Footer Navigation">
          {footerColumns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => {
                  const isMarketPartnersuche = link.href.startsWith(`https://${config.domain}/partnersuche`);
                  const previewHref = isMarketPartnersuche
                    ? marketPreviewPath(market, new URL(link.href).pathname)
                    : "";
                  return (
                    <li key={`${column.title}-${link.label}`}>
                      {isMarketPartnersuche ? (
                        <MarketLink href={link.href} previewHref={previewHref}>{link.label}</MarketLink>
                      ) : (
                        <a href={link.href} {...externalAttrs(link.external)}>{link.label}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="sub-footer">
        <div><span>© {new Date().getFullYear()} {config.siteName}</span></div>
        <div className="sub-footer-links">
          <a href={markets.de.homeUrl}>ab50.de</a>
          <a href={markets.ch.homeUrl}>ab50.ch</a>
        </div>
      </div>
    </footer>
  );
}
