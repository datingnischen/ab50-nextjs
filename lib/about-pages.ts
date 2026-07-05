export const ABOUT_ROOT_PATH = "/ueber-uns";
export const ABOUT_HISTORY_PATH = `${ABOUT_ROOT_PATH}/geschichte`;
export const ABOUT_SOCIAL_PATH = `${ABOUT_ROOT_PATH}/social-media`;
export const ABOUT_REVIEWS_PATH = `${ABOUT_ROOT_PATH}/bewertungen`;

export type AboutStandardRouteSlug = "geschichte" | "social-media" | "bewertungen";

export function aboutPath(subpage?: AboutStandardRouteSlug) {
  if (!subpage) return ABOUT_ROOT_PATH;
  return `${ABOUT_ROOT_PATH}/${subpage}`;
}

export function standardPageSlugFromAboutRoute(slug: string) {
  switch (slug) {
    case "social-media":
      return "social-media" as const;
    case "bewertungen":
      return "bewertungen-und-erfahrungen" as const;
    default:
      return null;
  }
}
