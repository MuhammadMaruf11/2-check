"use client";

import { useRouter, usePathname } from "next/navigation";
import { Pagination } from "antd";
import ArticleCard, { ArticleCardData } from "@/components/site/ArticleCard";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import Reveal from "@/components/site/Reveal";

export default function BlogListingClient({
  initialArticles,
  total,
  totalPages,
  page,
  searchParams,
}: {
  initialArticles: ArticleCardData[];
  total: number;
  totalPages: number;
  page: number;
  searchParams: { [key: string]: string | undefined };
}) {
  const router = useRouter();
  const pathname = usePathname();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams as Record<string, string>);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-display text-4xl font-bold text-ink">Articles</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          {total} in-depth articles, comparisons, and buying guides from our editorial team.
        </p>
      </Reveal>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <GlobalSearch placeholder="Search articles..." onSearch={(v) => updateParams({ search: v || undefined })} />
        {searchParams.tag && (
          <button
            onClick={() => updateParams({ tag: undefined })}
            className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong"
          >
            #{searchParams.tag} ✕
          </button>
        )}
      </div>

      {initialArticles.length === 0 ? (
        <div className="mt-24 flex flex-col items-center text-center">
          <p className="font-display text-xl text-ink">No articles match your search</p>
          <p className="mt-2 text-sm text-foreground-muted">Try a different search term.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialArticles.map((article, i) => (
            <Reveal key={article.slug} delay={(i % 6) * 60}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            current={page}
            total={total}
            pageSize={9}
            showSizeChanger={false}
            onChange={(p) => {
              const next = new URLSearchParams(searchParams as Record<string, string>);
              next.set("page", String(p));
              router.push(`${pathname}?${next.toString()}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
