"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import ProductCard, { ProductCardData } from "@/components/site/ProductCard";
import ArticleCard, { ArticleCardData } from "@/components/site/ArticleCard";
import Reveal from "@/components/site/Reveal";

interface CategoryResult {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function SearchPageClient({
  query,
  products,
  articles,
  categories,
}: {
  query: string;
  products: ProductCardData[];
  articles: ArticleCardData[];
  categories: CategoryResult[];
}) {
  const router = useRouter();
  const hasResults = products.length > 0 || articles.length > 0 || categories.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <h1 className="font-display text-3xl font-bold text-ink">Search</h1>
        <div className="mt-6 max-w-xl">
          <GlobalSearch
            placeholder="Search products, articles, categories..."
            onSearch={(v) => router.push(v ? `/search?q=${encodeURIComponent(v)}` : "/search")}
          />
        </div>
      </Reveal>

      {!query ? (
        <p className="mt-10 text-foreground-muted">Start typing to search across TechToCheck.</p>
      ) : !hasResults ? (
        <p className="mt-10 text-foreground-muted">No results for &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="mt-10 space-y-14">
          {categories.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold text-ink">Categories</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink hover:border-accent hover:text-accent transition-colors"
                  >
                    {c.name} ({c._count.products})
                  </Link>
                ))}
              </div>
            </section>
          )}

          {products.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold text-ink">Products</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}

          {articles.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-bold text-ink">Articles</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
