import type { MagazineBanner } from "@/lib/magazine-banner";
import { staticAsset } from "@/lib/static-asset";
import { siteConfig } from "@/data/site";
import { ArrowIcon } from "@/components/ab-icons";

export function TopicBanner({ banner, placement }: { banner: MagazineBanner; placement: "sidebar" | "article" }) {
  return (
    <aside id={`topic-banner-${placement}`} className={`abg-topic-banner abg-topic-banner-${placement}`} aria-label="ab50.de kennenlernen" data-banner-topic={banner.topic}>
      {/* The portrait window shows only the top of the original artwork; the fictional profile label stays outside the window. */}
      <div className="abg-topic-portrait" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- local artwork with a fixed portrait window */}
        <img src={staticAsset(`/cta/neustart-${banner.image}.jpg`)} alt={banner.title} width={1080} height={1080} loading="lazy" decoding="async" />
      </div>
      <div className="abg-topic-copy">
        <span className="ab-eyebrow">Neue Kontakte auf ab50.de</span>
        <h2>{banner.title}</h2>
        <p>{banner.text}</p>
        <a className="ab-btn ab-btn-primary" href={siteConfig.links.registrationCommon}>Kostenlos anmelden <ArrowIcon /></a>
      </div>
    </aside>
  );
}
