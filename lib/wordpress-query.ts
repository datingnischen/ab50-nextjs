export const POST_CARD_FIELDS = [
  "id",
  "slug",
  "date",
  "modified",
  "title",
  "excerpt",
  "featured_media",
  "_links",
  "_embedded",
].join(",");

export function postCardQuery(first: number) {
  return {
    per_page: first,
    page: 1,
    _embed: "wp:featuredmedia",
    _fields: POST_CARD_FIELDS,
    orderby: "date",
    order: "desc",
  } as const;
}
