import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import { categoryPath, getPostsByCategory, postPath, stripHtml } from "@/lib/wordpress";
import { siteConfig } from "@/data/site";
import { formatGermanDate } from "@/lib/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { getCategories } = await import("@/lib/wordpress");
  const categories = await getCategories(50);
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPostsByCategory(slug, 1);
  if (!category) return {};
  const title = `${category.name} – 50plus Magazin`;
  const description = category.description || `Alle Beiträge aus dem 50plus Magazin zum Thema ${category.name}.`;

  return {
    title,
    description,
    alternates: { canonical: categoryPath(category.slug) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(categoryPath(category.slug)),
      type: "website",
      locale: "de_DE",
      siteName: siteConfig.name,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getPostsByCategory(slug, 24);
  if (!category) notFound();

  return (
    <section className="container section-block category-page">
      <div className="section-heading wide-heading">
        <p className="eyebrow">Magazin-Kategorie</p>
        <h1>{category.name}</h1>
        <p>{category.description || `Alle Beiträge aus dem 50plus Magazin zum Thema ${category.name}.`}</p>
      </div>

      <div className="post-grid">
        {category.posts.map((post) => (
          <a className="post-card" href={postPath(post.slug)} key={post.slug}>
            {post.featuredImage?.sourceUrl ? (
              <Image
                src={post.featuredImage.sourceUrl}
                alt={post.featuredImage.altText || stripHtml(post.title)}
                width={post.featuredImage.width || 900}
                height={post.featuredImage.height || 600}
                className="post-card-image"
                sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"
              />
            ) : (
              <div className="post-card-placeholder" />
            )}
            <div className="post-card-body">
              <span>{formatGermanDate(post.date) || siteConfig.magazineName}</span>
              <strong>{stripHtml(post.title)}</strong>
              <p>{stripHtml(post.excerpt).slice(0, 160)}…</p>
              <em className="card-read-more">Beitrag lesen</em>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
