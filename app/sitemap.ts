import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { getAllPageSlugs, getAllPostSlugs, getAllPublicCitySlugs, getCategories, getLatestPosts, categoryPath, cityPath, pagePath, postPath } from "@/lib/wordpress";
import { withBerlinOffset } from "@/lib/site-entities";
import { ABOUT_HISTORY_PATH, ABOUT_REVIEWS_PATH, ABOUT_ROOT_PATH, ABOUT_SOCIAL_PATH } from "@/lib/about-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postSlugs, pageSlugs, categories, citySlugs, posts] = await Promise.all([
    getAllPostSlugs(),
    getAllPageSlugs(),
    getCategories(50),
    getAllPublicCitySlugs(),
    getLatestPosts(1000),
  ]);

  const now = new Date();
  // Beiträge mit ihrem eigenen Änderungsdatum (Berliner Zeit), nicht alle mit derselben Build-Sekunde.
  const postModified = new Map<string, string | undefined>(posts.map((post) => [post.slug, withBerlinOffset(post.modified || post.date)]));

  return [
    { url: `${siteConfig.baseUrl}/`, lastModified: now },
    { url: `${siteConfig.baseUrl}/magazin/`, lastModified: now },
    { url: `${siteConfig.baseUrl}/partnersuche/`, lastModified: now },
    { url: `${siteConfig.baseUrl}${ABOUT_ROOT_PATH}`, lastModified: now },
    { url: `${siteConfig.baseUrl}${ABOUT_HISTORY_PATH}`, lastModified: now },
    { url: `${siteConfig.baseUrl}${ABOUT_SOCIAL_PATH}`, lastModified: now },
    { url: `${siteConfig.baseUrl}/faq/`, lastModified: now },
    { url: `${siteConfig.baseUrl}${ABOUT_REVIEWS_PATH}`, lastModified: now },
    ...postSlugs.map((slug) => ({ url: `${siteConfig.baseUrl}${postPath(slug)}`, lastModified: postModified.get(slug) ?? now })),
    ...pageSlugs.map((slug) => ({ url: `${siteConfig.baseUrl}${pagePath(slug)}`, lastModified: now })),
    ...categories.map((category) => ({ url: `${siteConfig.baseUrl}${categoryPath(category.slug)}`, lastModified: now })),
    ...citySlugs.map((slug) => ({ url: `${siteConfig.baseUrl}${cityPath(slug)}`, lastModified: now })),
  ];
}
