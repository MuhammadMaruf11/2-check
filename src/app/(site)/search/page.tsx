import { Metadata } from "next";
import { productService } from "@/services/product.service";
import { blogService } from "@/services/blog.service";
import { categoryService } from "@/services/category.service";
import SearchPageClient from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  if (!query) {
    return (
      <SearchPageClient query={query} products={[]} articles={[]} categories={[]} />
    );
  }

  const [productData, blogData, categories] = await Promise.all([
    productService.getAll({ search: query, limit: 8 }),
    blogService.getAll(1, 6, "PUBLISHED", query),
    categoryService.search(query),
  ]);

  return (
    <SearchPageClient
      query={query}
      products={JSON.parse(JSON.stringify(productData.products))}
      articles={JSON.parse(JSON.stringify(blogData.blogs))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
