import { siteConfig } from "@/data/site";

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.baseUrl).toString();
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
