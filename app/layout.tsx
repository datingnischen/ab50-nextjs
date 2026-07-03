import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: "ab50.de – 50plus Magazin",
    template: "%s | ab50.de",
  },
  description: "Das 50plus Magazin von ab50.de: Dating, Beziehung, Sicherheit und Neuanfang für Singles ab 50.",
  alternates: { canonical: siteConfig.magazinePath },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: siteConfig.name,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
