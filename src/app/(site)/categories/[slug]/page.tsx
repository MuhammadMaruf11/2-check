import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import ProductListingClient from "../../products/ProductListingClient";

export const revalidate = 60;

// Dedupe generateMetadata() + page-body fetches within one request.
const getCategory = cache((slug: string) => categoryService.getBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: category.name,
    description: category.description || `Browse our independently tested ${category.name.toLowerCase()} reviews.`,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;

  // All three independent - the category-exists check doesn't need to block
  // fetching the product list or the sidebar category list.
  const [category, data, categories] = await Promise.all([
    getCategory(slug),
    productService.getAll({
      page,
      limit: 12,
      categorySlug: slug,
      sort: (sp.sort as "newest" | "rating" | "priceAsc" | "priceDesc" | "name") || "newest",
    }),
    categoryService.getAllWithPublishedProducts(),
  ]);

  if (!category) notFound();

  return (
    <ProductListingClient
      initialProducts={JSON.parse(JSON.stringify(data.products))}
      total={data.total}
      totalPages={data.totalPages}
      page={page}
      categories={JSON.parse(JSON.stringify(categories))}
      searchParams={{ ...sp, category: slug }}
    />
  );
}
