import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { getAllPageSlugs, getAllPostSlugs, getCategories, categoryPath, pagePath, postPath } from "@/lib/wordpress";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postSlugs, pageSlugs, categories] = await Promise.all([
    getAllPostSlugs(),
    getAllPageSlugs(),
    getCategories(50),
  ]);

  const now = new Date();

  return [
    { url: `${siteConfig.baseUrl}/`, lastModified: now },
    { url: `${siteConfig.baseUrl}/magazin`, lastModified: now },
    ...postSlugs.map((slug) => ({ url: `${siteConfig.baseUrl}${postPath(slug)}`, lastModified: now })),
    ...pageSlugs.map((slug) => ({ url: `${siteConfig.baseUrl}${pagePath(slug)}`, lastModified: now })),
    ...categories.map((category) => ({ url: `${siteConfig.baseUrl}${categoryPath(category.slug)}`, lastModified: now })),
  ];
}
