import Image from "next/image";
import { ArrowIcon, ChatIcon, CompassIcon, HeartIcon, PhoneIcon, ShieldIcon, SparkIcon, UsersIcon } from "@/components/ab-icons";
import { formatUpdatedLabel } from "@/lib/format";
import { excerptText, themeFor, type ThemeIcon } from "@/lib/magazine-themes";
import { postPath, stripHtml, type WpCategory, type WpPostCard } from "@/lib/wordpress";

export function ThemeIconView({ icon, className }: { icon: ThemeIcon; className?: string }) {
  switch (icon) {
    case "phone": return <PhoneIcon className={className} />;
    case "chat": return <ChatIcon className={className} />;
    case "shield": return <ShieldIcon className={className} />;
    case "users": return <UsersIcon className={className} />;
    case "compass": return <CompassIcon className={className} />;
    case "spark": return <SparkIcon className={className} />;
    default: return <HeartIcon className={className} />;
  }
}

/** Artikelkarte: Bild, Themen-Chip, Datum, Titel, Auszug. */
export function PostCard({ post, categories = [], large = false }: { post: WpPostCard; categories?: WpCategory[]; large?: boolean }) {
  const category = post.categories?.[0] || categories.find((item) => post.categoryIds?.includes(item.id));
  const theme = themeFor(category?.slug);
  const title = stripHtml(post.title);
  return (
    <a className={`abg-card abg-tone-${theme.tone}${large ? " abg-card-large" : ""}`} href={postPath(post.slug)}>
      <span className="abg-card-media">
        {post.featuredImage?.sourceUrl ? (
          <Image
            src={post.featuredImage.sourceUrl}
            alt={post.featuredImage.altText || title}
            width={post.featuredImage.width || 900}
            height={post.featuredImage.height || 600}
            sizes={large ? "(max-width: 1020px) 100vw, 480px" : "(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"}
            priority={large}
          />
        ) : <span className="abg-card-ph"><HeartIcon /></span>}
        {category ? <span className="abg-chip"><ThemeIconView icon={theme.icon} />{category.name}</span> : null}
      </span>
      <span className="abg-card-body">
        <small>{formatUpdatedLabel(post)}</small>
        <strong>{title}</strong>
        <span className="abg-card-excerpt">{excerptText(post.excerpt)}</span>
        <em>Beitrag lesen <ArrowIcon /></em>
      </span>
    </a>
  );
}
