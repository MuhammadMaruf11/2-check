import { MetadataRoute } from "next";
import { productService } from "@/services/product.service";
import { blogService } from "@/services/blog.service";
import { categoryService } from "@/services/category.service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsData, articles, categories] = await Promise.all([
    productService.getAll({ limit: 1000 }),
    blogService.getPublished(1000),
    categoryService.getAll(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/affiliate-disclosure`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const productRoutes: MetadataRoute.Sitemap = productsData.products.map((p: { slug: string; updatedAt: Date | string }) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a: { slug: string; updatedAt: Date | string }) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: { slug: string }) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes, ...categoryRoutes];
}
