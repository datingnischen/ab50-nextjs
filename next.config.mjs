/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
      }
    ]
  }
};

export default nextConfig;
