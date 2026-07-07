'use client';

import { usePathname } from 'next/navigation';
import { siteConfig } from '@/data/site';

export function StickyCTAButton() {
  const pathname = usePathname();
  
  // Extract city from pathname (e.g., /partnersuche/berlin -> berlin)
  const cityMatch = pathname.match(/\/partnersuche\/([^\/]+)/);
  const city = cityMatch ? cityMatch[1] : null;
  
  // Build CTA based on page type
  let ctaText = 'Kostenlos registrieren';
  let ctaUrl = `${siteConfig.links.registrationCommon}?aid=magazin`;
  let ariaLabel = 'Kostenlos registrieren';
  
  if (city) {
    // City page: use location aid
    const cityName = decodeURIComponent(city)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    ctaText = `Singles in ${cityName} finden`;
    ctaUrl = `${siteConfig.links.registrationCommon}?aid=location`;
    ariaLabel = `Singles in ${cityName} finden`;
  } else if (pathname.includes('/magazin/')) {
    // Magazine page: use magazin aid
    ctaUrl = `${siteConfig.links.registrationCommon}?aid=magazin`;
    ariaLabel = 'Kostenlos registrieren';
  }
  
  return (
    <a 
      href={ctaUrl}
      className="sticky-cta-button"
      aria-label={ariaLabel}
    >
      <span className="sticky-cta-text">{ctaText}</span>
      <span className="sticky-cta-icon" aria-hidden="true">→</span>
    </a>
  );
}
