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
    trailingSlash: false,
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
