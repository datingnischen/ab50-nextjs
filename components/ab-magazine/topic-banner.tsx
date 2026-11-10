import type { MagazineBanner } from "@/lib/magazine-banner";
import { staticAsset } from "@/lib/static-asset";
import { siteConfig } from "@/data/site";
import { registrationUrl, type MarketCode } from "@/lib/markets";
import { ArrowIcon } from "@/components/ab-icons";

export function TopicBanner({ banner, placement, market = "de" }: { banner: MagazineBanner; placement: "sidebar" | "article"; market?: MarketCode }) {
  // Eigene ab50.ch-Beiträge: Anmeldung und Text für ab50.ch statt ab50.de.
  const brand = market === "ch" ? "ab50.ch" : "ab50.de";
  const registration = market === "ch" ? registrationUrl("ch", "magazin") : siteConfig.links.registrationCommon;
  return (
    <aside id={`topic-banner-${placement}`} className={`abg-topic-banner abg-topic-banner-${placement}`} aria-label={`${brand} kennenlernen`} data-banner-topic={banner.topic}>
      {/* The portrait window shows only the top of the original artwork; the fictional profile label stays outside the window. */}
      <div className="abg-topic-portrait" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- local artwork with a fixed portrait window */}
        <img src={staticAsset(`/cta/neustart-${banner.image}.jpg`)} alt={banner.title} width={1080} height={1080} loading="lazy" decoding="async" />
      </div>
      <div className="abg-topic-copy">
        <span className="ab-eyebrow">Neue Kontakte auf {brand}</span>
        {/* Der Banner steht nur noch einmal im DOM (Seitenleiste oder, ohne Seitenleiste, im Text). */}
        <p className="abg-topic-title">{banner.title}</p>
        <p>{banner.text.replace("ab50.de", brand)}</p>
        <a className="ab-btn ab-btn-primary" href={registration}>Kostenlos anmelden <ArrowIcon /></a>
      </div>
    </aside>
  );
}
