import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { getAllPageSlugs, getAllPostSlugs, getAllPublicCitySlugs, getCategories, categoryPath, cityPath, pagePath, postPath } from "@/lib/wordpress";
import { ABOUT_REVIEWS_PATH, ABOUT_ROOT_PATH, ABOUT_SOCIAL_PATH } from "@/lib/about-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postSlugs, pageSlugs, categories, citySlugs] = await Promise.all([
    getAllPostSlugs(),
    getAllPageSlugs(),
    getCategories(50),
    getAllPublicCitySlugs(),
  ]);

  const now = new Date();

  return [
    { url: `${siteConfig.baseUrl}/`, lastModified: now },
    { url: `${siteConfig.baseUrl}/magazin`, lastModified: now },
    { url: `${siteConfig.baseUrl}/partnersuche`, lastModified: now },
    { url: `${siteConfig.baseUrl}${ABOUT_ROOT_PATH}`, lastModified: now },
    { url: `${siteConfig.baseUrl}${ABOUT_SOCIAL_PATH}`, lastModified: now },
    { url: `${siteConfig.baseUrl}${ABOUT_REVIEWS_PATH}`, lastModified: now },
    ...postSlugs.map((slug) => ({ url: `${siteConfig.baseUrl}${postPath(slug)}`, lastModified: now })),
    ...pageSlugs.map((slug) => ({ url: `${siteConfig.baseUrl}${pagePath(slug)}`, lastModified: now })),
    ...categories.map((category) => ({ url: `${siteConfig.baseUrl}${categoryPath(category.slug)}`, lastModified: now })),
    ...citySlugs.map((slug) => ({ url: `${siteConfig.baseUrl}${cityPath(slug)}`, lastModified: now })),
  ];
}
