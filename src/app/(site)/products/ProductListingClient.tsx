"use client";

import { useRouter, usePathname } from "next/navigation";
import { Pagination, Select } from "antd";
import ProductCard, { ProductCardData } from "@/components/site/ProductCard";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import Reveal from "@/components/site/Reveal";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function ProductListingClient({
  initialProducts,
  total,
  totalPages,
  page,
  categories,
  searchParams,
}: {
  initialProducts: ProductCardData[];
  total: number;
  totalPages: number;
  page: number;
  categories: Category[];
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
        <h1 className="font-display text-4xl font-bold text-ink">All Reviews</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          {total} independently tested products, rated on performance, value, and real-world use.
        </p>
      </Reveal>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <GlobalSearch
          placeholder="Search products..."
          onSearch={(v) => updateParams({ search: v || undefined })}
        />
        <div className="flex gap-3">
          <Select
            value={searchParams.category || "all"}
            style={{ width: 180 }}
            onChange={(v) => {
              const next = new URLSearchParams(searchParams as Record<string, string>);
              if (v === "all") next.delete("category");
              else next.set("category", v);
              next.delete("page");
              // Category changes always resolve through the general listing page,
              // since a category page navigating to a different category doesn't make sense as a URL.
              router.push(`/products?${next.toString()}`);
            }}
            options={[
              { value: "all", label: "All categories" },
              ...categories.map((c) => ({ value: c.slug, label: `${c.name} (${c._count.products})` })),
            ]}
          />
          <Select
            value={searchParams.sort || "newest"}
            style={{ width: 160 }}
            onChange={(v) => updateParams({ sort: v === "newest" ? undefined : v })}
            options={[
              { value: "newest", label: "Newest" },
              { value: "rating", label: "Top Rated" },
              { value: "priceAsc", label: "Price: Low to High" },
              { value: "priceDesc", label: "Price: High to Low" },
              { value: "name", label: "Name A-Z" },
            ]}
          />
        </div>
      </div>

      {initialProducts.length === 0 ? (
        <div className="mt-24 flex flex-col items-center text-center">
          <p className="font-display text-xl text-ink">No products match your filters</p>
          <p className="mt-2 text-sm text-foreground-muted">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialProducts.map((product, i) => (
            <Reveal key={product.slug} delay={(i % 6) * 60}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            current={page}
            total={total}
            pageSize={12}
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
