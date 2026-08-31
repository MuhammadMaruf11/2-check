import { Metadata } from "next";
import { blogService } from "@/services/blog.service";
import BlogListingClient from "./BlogListingClient";

export const metadata: Metadata = {
  title: "Articles",
  description: "In-depth technology articles, comparisons, and buying guides from the TechToCheck team.",
};

export const revalidate = 60;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const data = await blogService.getAll(page, 9, "PUBLISHED", params.search || "", undefined, params.tag);

  return (
    <BlogListingClient
      initialArticles={JSON.parse(JSON.stringify(data.blogs))}
      total={data.total}
      totalPages={data.totalPages}
      page={page}
      searchParams={params}
    />
  );
}
