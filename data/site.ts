export const siteConfig = {
  name: "ab50.de",
  magazineName: "50plus Magazin",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://ab50.de",
  wordpressUrl: "https://ab50.de/magazin",
  wordpressRestEndpoint:
    process.env.WORDPRESS_REST_ENDPOINT || "https://ab50.de/magazin/wp-json/wp/v2",
  magazinePath: "/magazin",
  colors: {
    primary: "#8d3b4f",
    primaryDark: "#6f2d3d",
    secondary: "#8c7b72",
    accent: "#b38b4d",
  },
  links: {
    home: "https://ab50.de/",
    registrationCommon: "https://ab50.de/?AID=magazin",
    magazine: "/magazin",
    imprint: "https://ab50.de/impressum.html",
    privacy: "https://ab50.de/datenschutz.html",
    terms: "https://ab50.de/agb.html",
  },
};
