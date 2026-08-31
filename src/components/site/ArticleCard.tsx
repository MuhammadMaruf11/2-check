import Link from "next/link";
import Image from "next/image";

export interface ArticleCardData {
  slug: string;
  title: string;
  subTitle?: string | null;
  coverImage?: string | null;
  tags: string[];
  publishedAt?: string | Date | null;
  createdAt: string | Date;
  author?: { name?: string | null; image?: string | null } | null;
}

export default function ArticleCard({ article }: { article: ArticleCardData }) {
  const date = article.publishedAt || article.createdAt;

  return (
    <Link href={`/blog/${article.slug}`} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-accent-soft">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-accent/40 font-display text-3xl">
            {article.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {article.tags?.[0] && (
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">{article.tags[0]}</span>
        )}
        <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.subTitle && <p className="line-clamp-2 text-sm text-foreground-muted">{article.subTitle}</p>}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-foreground-muted">
          <span>{article.author?.name || "TechToCheck Team"}</span>
          <time dateTime={new Date(date).toISOString()}>{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
        </div>
      </div>
    </Link>
  );
}
