'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function aidFromPathname(pathname: string) {
  return pathname.includes('/partnersuche/') ? 'location' : 'magazin';
}

export function StickyCTAButton() {
  const pathname = usePathname();
  const [ctaText, setCtaText] = useState('Kostenlos registrieren');
  const [ctaUrl, setCtaUrl] = useState(`https://ab50.de/?aid=${aidFromPathname(pathname)}`);

  useEffect(() => {
    const fetchCTAText = async () => {
      try {
        // Determine endpoint and slug
        let endpoint = '';
        let slug = '';
        let aid = 'magazin';

        // Check if city/partnersuche page
        const partnersucheMatch = pathname.match(/\/partnersuche\/([^\/]+)/);
        if (partnersucheMatch) {
          endpoint = 'stadt';
          slug = partnersucheMatch[1];
          aid = 'location';
        }
        // Check if magazine article
        else if (pathname.includes('/magazin/')) {
          const magazinMatch = pathname.match(/\/magazin\/([^\/]+)/);
          if (magazinMatch) {
            endpoint = 'posts';
            slug = magazinMatch[1];
            aid = 'magazin';
          }
        }

        if (!endpoint || !slug) {
          // Use defaults
          setCtaUrl(`https://ab50.de/?aid=${aid}`);
          return;
        }

        // Fetch CTA source record from WordPress REST API
        const wpUrl = `https://ab50.de/magazin/wp-json/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&_fields=id,acf`;
        const response = await fetch(wpUrl, { cache: 'no-store' });

        if (!response.ok) {
          setCtaUrl(`https://ab50.de/?aid=${aid}`);
          return;
        }

        const posts = await response.json();
        if (!Array.isArray(posts) || posts.length === 0) {
          setCtaUrl(`https://ab50.de/?aid=${aid}`);
          return;
        }

        const footerCtaText = posts[0].acf?.footer_cta_button_text;

        if (footerCtaText) {
          setCtaText(footerCtaText);
        }

        setCtaUrl(`https://ab50.de/?aid=${aid}`);
      } catch (error) {
        console.error('Error fetching CTA text:', error);
        // Fallback to route-aware default
        setCtaUrl(`https://ab50.de/?aid=${aidFromPathname(pathname)}`);
      }
    };

    fetchCTAText();
  }, [pathname]);

  return (
    <a 
      href={ctaUrl}
      className="sticky-cta-button"
      aria-label={ctaText}
    >
      <span className="sticky-cta-text">{ctaText}</span>
      <span className="sticky-cta-icon" aria-hidden="true">→</span>
    </a>
  );
}