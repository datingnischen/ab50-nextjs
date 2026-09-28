import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "./ab-base.css";
import "./ab-shell.css";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { StickyCTAButton } from "@/components/sticky-cta-button";
import { siteConfig } from "@/data/site";
import { staticAsset } from "@/lib/static-asset";

// Überschriften: Fraunces (warme Serifenschrift), Fließtext: Source Sans 3 – gut lesbar für Singles ab 50.
const display = Fraunces({ variable: "--ab-display", subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"] });
const body = Source_Sans_3({ variable: "--ab-body", subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: "ab50.de – 50plus Magazin",
    template: "%s | ab50.de",
  },
  description: "Das 50plus Magazin von ab50.de: Dating, Beziehung, Sicherheit und Neuanfang für Singles ab 50.",
  icons: {
    icon: staticAsset("/brand/icon.png"),
    apple: staticAsset("/brand/apple-icon.png"),
  },
  alternates: { canonical: siteConfig.magazinePath },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <StickyCTAButton />
      </body>
    </html>
  );
}
