import { Metadata } from "next";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import ProductListingClient from "./ProductListingClient";

export const metadata: Metadata = {
  title: "All Reviews",
  description: "Browse every technology product review, rated and compared by our editorial team.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const [data, categories] = await Promise.all([
    productService.getAll({
      page,
      limit: 12,
      search: params.search || "",
      categorySlug: params.category,
      isFeatured: params.featured === "true" ? true : undefined,
      sort: (params.sort as "newest" | "rating" | "priceAsc" | "priceDesc" | "name") || "newest",
    }),
    categoryService.getAllWithPublishedProducts(),
  ]);

  return (
    <ProductListingClient
      initialProducts={JSON.parse(JSON.stringify(data.products))}
      total={data.total}
      totalPages={data.totalPages}
      page={page}
      categories={JSON.parse(JSON.stringify(categories))}
      searchParams={params}
    />
  );
}
