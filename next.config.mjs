import path from "node:path";
import { fileURLToPath } from "node:url";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Der nginx vor den Live-Domains reicht nur Seitenrouten an Vercel weiter.
// Assets (/_next, /_next/image, public-Dateien) kommen darum absolut vom Vercel-Host.
const DEFAULT_ASSET_HOST = "https://ab50-nextjs.vercel.app";
const DEFAULT_ASSET_PATH_PREFIX = "/app-assets";

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function normalizeAssetPathPrefix(value) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  const trimmed = trimTrailingSlash(withLeadingSlash);
  return trimmed || DEFAULT_ASSET_PATH_PREFIX;
}

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const assetHost = trimTrailingSlash(process.env.NEXT_PUBLIC_ASSET_HOST || DEFAULT_ASSET_HOST);
  const assetHostname = new URL(assetHost).hostname;
  const assetPathPrefix = normalizeAssetPathPrefix(
    process.env.NEXT_PUBLIC_ASSET_PATH_PREFIX || DEFAULT_ASSET_PATH_PREFIX,
  );

  return {
    turbopack: { root: projectRoot },
    poweredByHeader: false,
    // Seitenpfade enden auf "/" (wie ICONY /login/). Die Umleitung macht proxy.ts, weil nur dort der
    // interne Marktpräfix (/ch/..., /de/...) bekannt ist.
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    assetPrefix: isDev ? undefined : `${assetHost}${assetPathPrefix}`,
    images: {
      // nginx vor den Live-Domains reicht /_next/image nicht weiter, darum optimiert der Vercel-Host.
      path: isDev ? "/_next/image" : `${assetHost}/_next/image`,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "ab50.de",
          pathname: "/magazin/wp-content/uploads/**",
        },
        {
          protocol: "https",
          hostname: "ab50.de",
          pathname: "/wp-content/uploads/**",
        },
        {
          protocol: "https",
          hostname: "static2.icony-hosting.de",
        },
        {
          protocol: "https",
          hostname: "cdn3.icony-hosting.de",
        },
        {
          protocol: "https",
          hostname: "static-cms.icony-hosting.de",
          pathname: "/cms/**",
        },
        {
          protocol: "https",
          hostname: assetHostname,
          pathname: `${assetPathPrefix}/**`,
        },
      ],
    },
    async redirects() {
      return [
        // Eine Adresse je Stadt: ASCII-Schreibweise auf die öffentliche Umlaut-Adresse (Duplicate Content, lib/city-slugs.ts).
        ...[["singles-muenchen", "singles-m%C3%BCnchen"], ["singles-duesseldorf", "singles-d%C3%BCsseldorf"]].flatMap(([from, to]) => [
          { source: `/partnersuche/${from}/:path*`, destination: `/partnersuche/${to}/:path*`, permanent: true },
          { source: `/partnersuche/${from}`, destination: `/partnersuche/${to}/`, permanent: true },
          { source: `/:market(de)/partnersuche/${from}/:path*`, destination: `/partnersuche/${to}/:path*`, permanent: true },
          { source: `/:market(de)/partnersuche/${from}`, destination: `/partnersuche/${to}/`, permanent: true },
        ]),
        {
          source: "/magazin/muslimische-partnersuche-ab-50/:path*",
          destination: "/magazin/muslimische-partnersuche/:path*",
          permanent: true,
        },
        {
          source: "/:market(de|ch|at)/magazin/muslimische-partnersuche-ab-50/:path*",
          destination: "/magazin/muslimische-partnersuche/:path*",
          permanent: true,
        },
      ];
    },
    async rewrites() {
      return [
        {
          source: `${assetPathPrefix}/:path*`,
          destination: "/:path*",
        },
      ];
    },
  };
}
