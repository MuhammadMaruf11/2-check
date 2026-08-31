import BlogForm from "@/app/(pages)/admin/blogs/_components/BlogForm";
import { productService } from "@/services/product.service";

export default async function AuthorCreatePostPage() {
  const products = await productService.getAllForSelect();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Post</h1>
        <p className="text-gray-500 text-sm">
          Your post starts as a draft. Submit it for review from the My Posts page when you&apos;re ready.
        </p>
      </div>
      <BlogForm products={products} redirectBasePath="/author/posts" />
    </div>
  );
}
