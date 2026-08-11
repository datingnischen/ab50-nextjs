import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  turbopack: { root: projectRoot },
  poweredByHeader: false,
  trailingSlash: false,
  images: {
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
    ],
  },
};

export default nextConfig;
