"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon, CheckIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, ShieldIcon } from "@/components/ab-icons";
import { MarketLink } from "@/components/market-link";
import { SiteSearchForm } from "@/components/site-search-form";
import { markets, marketFromLocation, marketPartnersuchePath, marketPreviewPath, registrationUrl, type MarketCode } from "@/lib/markets";
import { staticAsset } from "@/lib/static-asset";

type NavLink = { label: string; href: string; previewHref?: string; external?: boolean; match?: RegExp };
type FooterColumn = { title: string; links: NavLink[] };

const LOGO: Record<MarketCode, { dark: string; light: string; width: number; height: number }> = {
  de: { dark: "/brand/ab50-de-logo.svg", light: "/brand/ab50-de-logo-light.svg", width: 556, height: 231 },
  ch: { dark: "/ab50-ch-logo.svg", light: "/brand/ab50-ch-logo-light.svg", width: 1486, height: 619 },
};

function useMarket() {
  const pathname = usePathname() || "/";
  const market = marketFromLocation(pathname, typeof window === "undefined" ? undefined : window.location.hostname);
  return { pathname, market };
}

function aidFor(pathname: string) {
  return pathname.includes("/partnersuche") ? "location" as const : "magazin" as const;
}

function navigation(market: MarketCode): NavLink[] {
  const partnersuche = marketPartnersuchePath(market);
  if (market === "de") {
    return [
      { label: "Magazin", href: "/magazin/", match: /^\/magazin\/?$/ },
      { label: "Online-Dating ab 50", href: "/magazin/kategorie/online-dating-ab-50/", match: /online-dating-ab-50/ },
      { label: "Beziehung & Nähe", href: "/magazin/kategorie/beziehung-naehe/", match: /beziehung-naehe/ },
      { label: "Partnersuche", href: partnersuche.publicUrl, previewHref: partnersuche.previewPath, match: /partnersuche/ },
      { label: "Über uns", href: "/ueber-uns/", match: /^\/ueber-uns/ },
    ];
  }
  return [
    { label: "Partnersuche", href: partnersuche.publicUrl, previewHref: partnersuche.previewPath, match: /partnersuche/ },
    { label: "Dating-Tipps", href: "https://ab50.ch/dating-tipps/", external: true },
    { label: "Erfolgsgeschichten", href: "https://ab50.ch/unsere-erfolgsgeschichten.html", external: true },
    { label: "FAQ", href: "https://ab50.ch/faq/", external: true },
  ];
}

function trustLinks(market: MarketCode): NavLink[] {
  const home = markets[market].homeUrl;
  return [
    { label: "Sicherheit & Datenschutz", href: `${home}sicherheit-und-datenschutz.html`, external: true },
    { label: "Redaktionelle Kontrolle", href: `${home}redaktionelle-kontrolle.html`, external: true },
    { label: "Kostenlose Basis-Mitgliedschaft", href: `${home}kostenlose-basis-mitgliedschaft.html`, external: true },
  ];
}

function NavAnchor({ link, className, current }: { link: NavLink; className?: string; current?: boolean }) {
  if (link.previewHref) {
    return <MarketLink className={className} href={link.href} previewHref={link.previewHref} ariaCurrent={current ? "page" : undefined}>{link.label}</MarketLink>;
  }
  return <a className={className} href={link.href} aria-current={current ? "page" : undefined}>{link.label}</a>;
}

function BrandLogo({ market, light = false }: { market: MarketCode; light?: boolean }) {
  const config = markets[market];
  const logo = LOGO[market];
  return (
    <a className="ab-brand" href={config.homeUrl} aria-label={`${config.siteName} Startseite`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG-Logo, keine Optimierung nötig */}
      <img src={staticAsset(light ? logo.light : logo.dark)} alt={config.logoAlt} width={logo.width} height={logo.height} />
    </a>
  );
}

export function SiteHeader() {
  const { pathname, market } = useMarket();
  const config = markets[market];
  const menu = useRef<HTMLDetailsElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const items = navigation(market);
  const register = registrationUrl(market, aidFor(pathname));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  const isCurrent = (link: NavLink) => Boolean(link.match && link.match.test(pathname));

  return (
    <header className="ab-header">
      <div className="ab-strip">
        <div className="ab-strip-inner">
          <span className="ab-strip-claim"><HeartIcon />{market === "de" ? "Das 50plus Magazin und die Partnersuche für Singles ab 50" : "Die Partnersuche ab 50 für die Schweiz"}</span>
          <span className="ab-strip-links">
            {trustLinks(market).map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
          </span>
        </div>
      </div>
      <div className={`ab-bar${scrolled ? " ab-bar-scrolled" : ""}`}>
        <div className="ab-bar-inner">
          <BrandLogo market={market} />
          <nav className="ab-nav" aria-label={`${config.siteName} Navigation`}>
            {items.map((link) => <NavAnchor key={link.label} link={link} className={isCurrent(link) ? "ab-nav-active" : undefined} current={isCurrent(link)} />)}
          </nav>
          <div className="ab-bar-actions">
            {market === "de" ? (
              <a className="ab-icon-link" href="/ueber-uns/suche/"><SearchIcon /><span className="ab-sr">Magazin und Städte durchsuchen</span></a>
            ) : null}
            <a className="ab-login" href={`${config.homeUrl}login/`}>Login</a>
            <a className="ab-btn ab-btn-primary ab-btn-small ab-register" href={register}>Kostenlos starten</a>
            <details className="ab-menu" ref={menu}>
              <summary aria-label="Menü öffnen">
                <MenuIcon className="ab-menu-open" />
                <CloseIcon className="ab-menu-close" />
              </summary>
              <div className="ab-menu-panel">
                {market === "de" ? <SiteSearchForm compact label="Magazin & Städte durchsuchen" /> : null}
                <nav aria-label="Menü">
                  {items.map((link) => <NavAnchor key={link.label} link={link} className={isCurrent(link) ? "ab-nav-active" : undefined} current={isCurrent(link)} />)}
                  <a href={`${config.homeUrl}login/`}>Login</a>
                  <a href={config.homeUrl}>Zur {config.siteName} Startseite</a>
                </nav>
                <a className="ab-btn ab-btn-primary" href={register}>Kostenlos starten <ArrowIcon /></a>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}

const deFooterColumns: FooterColumn[] = [
  {
    title: "Magazin",
    links: [
      { label: "50plus Magazin", href: "/magazin/" },
      { label: "Online-Dating ab 50", href: "/magazin/kategorie/online-dating-ab-50/" },
      { label: "Beziehung & Nähe", href: "/magazin/kategorie/beziehung-naehe/" },
      { label: "Sicherheit & Vertrauen", href: "/magazin/kategorie/sicherheit-vertrauen/" },
      { label: "Leben & Neuanfang ab 50", href: "/magazin/kategorie/leben/" },
      { label: "Profil & Kommunikation", href: "/magazin/kategorie/profil-kommunikation/" },
      { label: "Singlebörsen & Vergleiche", href: "/magazin/kategorie/singleboersen-vergleiche/" },
      { label: "Freizeit & Aktiv bleiben", href: "/magazin/kategorie/freizeit-aktiv-bleiben/" },
    ],
  },
  {
    title: "Über uns",
    links: [
      { label: "Über ab50.de", href: "/ueber-uns/" },
      { label: "Geschichte", href: "/ueber-uns/geschichte/" },
      { label: "Social Media", href: "/ueber-uns/social-media/" },
      { label: "Bewertungen & Erfahrungen", href: "/ueber-uns/bewertungen/" },
      { label: "Christian M. Haas", href: "/magazin/christian-m-haas/" },
      { label: "Suche", href: "/ueber-uns/suche/" },
    ],
  },
  {
    title: "Partnersuche & Service",
    links: [
      { label: "Regionale Partnersuche", href: "https://ab50.de/partnersuche/", previewHref: "/de/partnersuche/" },
      { label: "Fragenflirt", href: "https://ab50.de/fragenflirt.html", external: true },
      { label: "Erfolgsgeschichten", href: "https://ab50.de/unsere-erfolgsgeschichten.html", external: true },
      { label: "Premiumvorteile", href: "https://ab50.de/premium-mitgliedschaft.html", external: true },
      { label: "Hilfe & Support", href: "https://ab50.de/hilfe/", external: true },
    ],
  },
];

const chFooterColumns: FooterColumn[] = [
  {
    title: "Partnersuche",
    links: [
      { label: "Schweizer Städte", href: "https://ab50.ch/partnersuche/" },
      { label: "Singles in Zürich", href: "https://ab50.ch/partnersuche/zuerich/" },
      { label: "Singles in Basel", href: "https://ab50.ch/partnersuche/basel/" },
      { label: "Singles in Bern", href: "https://ab50.ch/partnersuche/bern/" },
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
];

function FooterAnchor({ market, link }: { market: MarketCode; link: NavLink }) {
  const config = markets[market];
  if (link.previewHref) return <MarketLink href={link.href} previewHref={link.previewHref}>{link.label}</MarketLink>;
  if (link.href.startsWith(`https://${config.domain}/partnersuche`)) {
    return <MarketLink href={link.href} previewHref={marketPreviewPath(market, new URL(link.href).pathname)}>{link.label}</MarketLink>;
  }
  return <a href={link.href}>{link.label}</a>;
}

export function SiteFooter() {
  const { pathname, market } = useMarket();
  const config = markets[market];
  const columns = market === "ch" ? chFooterColumns : deFooterColumns;
  const register = registrationUrl(market, aidFor(pathname));
  const legal = [
    { label: "Impressum", href: `${config.homeUrl}impressum.html` },
    { label: "Datenschutz", href: `${config.homeUrl}datenschutz.html` },
    { label: "AGB", href: `${config.homeUrl}agb.html` },
    { label: "Barrierefreiheit", href: `${config.homeUrl}barrierefreiheit.html` },
  ];

  return (
    <footer className="ab-footer">
      <div className="ab-footer-inner">
        <section className="ab-footer-cta" aria-label="Registrierung">
          <div>
            <p className="ab-eyebrow">Dating ab 50 – entspannt und sicher</p>
            <h2>Treffe passende Singles {market === "ch" ? "in der Schweiz" : "in Deutschland"} und starte neu.</h2>
            <p>Profil kostenlos anlegen, seriöse Kontakte entdecken und in deinem eigenen Tempo neue Menschen kennenlernen.</p>
          </div>
          <a className="ab-btn ab-footer-cta-button" href={register}>Kostenlos starten <ArrowIcon /></a>
        </section>

        <div className="ab-footer-main">
          <div className="ab-footer-brand">
            <BrandLogo market={market} light />
            <p>{market === "ch" ? "Die Partnersuche ab 50 für die Schweiz: regionale Seiten, sichere Kontakte und hilfreiche Dating-Tipps." : "Das 50plus Magazin: echte Tipps zu Dating ab 50, Sicherheit, Kommunikation und wie du neue Beziehungen aufbaust."}</p>
            <ul className="ab-footer-trust">
              <li><CheckIcon />Profil kostenlos – kein Abo nötig zum Stöbern</li>
              <li><CheckIcon />Sichere Nachrichtenbox und geprüfte Profile</li>
              <li><ShieldIcon />Regionale Einstiege für Singles ab 50</li>
            </ul>
          </div>
          <nav className="ab-footer-nav" aria-label="Footer Navigation">
            {columns.map((column) => (
              <div key={column.title} className="ab-footer-column">
                <h2>{column.title}</h2>
                <ul>
                  {column.links.map((link) => <li key={`${column.title}-${link.label}`}><FooterAnchor market={market} link={link} /></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="ab-footer-bottom">
          <span>© {new Date().getFullYear()} {config.siteName} · Partnersuche ab 50</span>
          <div className="ab-footer-legal">
            {legal.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
            <span className="ab-footer-markets" aria-label="Land wählen">
              <a href={markets.de.homeUrl} aria-current={market === "de" ? "true" : undefined}>ab50.de</a>
              <a href={markets.ch.homeUrl} aria-current={market === "ch" ? "true" : undefined}>ab50.ch</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
