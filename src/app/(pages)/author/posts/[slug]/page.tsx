import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BlogForm from "@/app/(pages)/admin/blogs/_components/BlogForm";
import { blogService } from "@/services/blog.service";
import { productService } from "@/services/product.service";

export default async function AuthorEditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const [blog, products] = await Promise.all([
    blogService.getBySlug(slug),
    productService.getAllForSelect(),
  ]);

  if (!blog) notFound();
  // Authors can only ever open their own posts here - admins editing anyone
  // else's work use the admin blog editor instead.
  if (blog.authorId !== session?.user.id && session?.user.role !== "ADMIN") {
    redirect("/author/posts");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit Post</h1>
        {blog.status === "REJECTED" && (
          <p className="mt-1 text-sm text-red-600">
            This post was rejected. Make your changes and submit it for review again from My Posts.
          </p>
        )}
      </div>
      <BlogForm products={products} initialData={blog} redirectBasePath="/author/posts" />
    </div>
  );
}
