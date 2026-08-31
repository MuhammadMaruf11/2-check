import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogForm from "../_components/BlogForm";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  console.log("Searching for blog with slug:", slug);
  const blog = await prisma.blog.findUnique({
    where: { slug: slug },
  });

  if (!blog) {
    console.log("Blog not found for slug:", slug);
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Blog</h1>
      <BlogForm initialData={blog} />;
    </div>
  );
}
