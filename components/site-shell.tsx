import { getCategories } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import type { WpCategory } from "@/lib/wordpress";

function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <a className={`brand-lockup${footer ? " footer-brand-lockup" : ""}`} href="/magazin" aria-label="ab50.de Magazin Startseite">
      <span className="brand-mark" aria-hidden="true">50+</span>
      <span className="brand-text"><strong>ab50.de</strong> <em>Magazin</em></span>
    </a>
  );
}

function externalAttrs(external?: boolean) {
  return external ? { target: "_blank", rel: "noopener" } : undefined;
}

function categoryLinks(categories: WpCategory[]) {
  return categories.slice(0, 5).map((category) => ({
    label: category.name,
    href: `/magazin/kategorie/${category.slug}`,
  }));
}

export async function SiteHeader() {
  const categories = await getCategories(8);
  const quickLinks = categoryLinks(categories);

  return (
    <header className="site-header-shell">
      <div className="site-header-bar compact-header-bar">
        <BrandLogo />

        <div className="header-actions compact-header-actions" aria-label="Navigation und Aktionen">
          <a className="header-register header-register-primary" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>

          <details className="header-menu">
            <summary aria-label="Menü öffnen">
              <span className="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
              <span className="header-menu-label">Menü</span>
            </summary>
            <div className="header-menu-panel">
              <nav className="main-nav compact-menu-nav" aria-label="Magazin Navigation">
                <a href="/magazin">Magazin-Start</a>
                {quickLinks.map((item) => (
                  <a href={item.href} key={item.href}>{item.label}</a>
                ))}
                <a className="header-menu-supplement" href={siteConfig.links.home} {...externalAttrs(true)}>Zur ab50.de Startseite</a>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const footerColumns: FooterColumn[] = [
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
      { label: "Regionale Partnersuche", href: "/partnersuche/" },
      { label: "Über ab50.de", href: "/ueber-uns" },
      { label: "ab50.de Startseite", href: siteConfig.links.home, external: true },
      { label: "Impressum", href: siteConfig.links.imprint, external: true },
      { label: "Datenschutz", href: siteConfig.links.privacy, external: true },
      { label: "AGB", href: siteConfig.links.terms, external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer-shell">
      <section className="footer-cta" aria-label="Registrierung">
        <div>
          <p className="eyebrow">Für Singles mit Lebenserfahrung</p>
          <h2>Entdecke Kontakte, Gespräche und Nähe mit Ruhe statt Dating-Hektik.</h2>
          <p>Das 50plus Magazin begleitet dich mit Orientierung, Vertrauen und praxisnahen Impulsen rund um Dating ab 50.</p>
        </div>
        <a className="footer-cta-button" href={siteConfig.links.registrationCommon}>Kostenlos starten</a>
      </section>

      <div className="footer-main">
        <div className="footer-brand-panel">
          <BrandLogo footer />
          <p>Ratgeber, Orientierung und Dating-Themen für Menschen, die bewusst, gelassen und mit Erfahrung neue Kontakte aufbauen möchten.</p>
          <ul className="footer-trust-list" aria-label="Vertrauensmerkmale">
            <li>Gut lesbar auf Handy und Desktop</li>
            <li>Praxisnahe Tipps speziell für 50+</li>
            <li>Fokus auf Sicherheit, Vertrauen und echte Begegnungen</li>
          </ul>
        </div>

        <nav className="footer-link-grid" aria-label="Footer Navigation">
          {footerColumns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <a href={link.href} {...externalAttrs(link.external)}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="sub-footer">
        <div>
          <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        </div>
        <div className="sub-footer-links">
          <a href={siteConfig.links.home} target="_blank" rel="noopener">ab50.de</a>
          <a href={siteConfig.links.homeCh} target="_blank" rel="noopener">ab50.ch</a>
        </div>
      </div>
    </footer>
  );
}
