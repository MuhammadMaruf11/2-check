import BlogForm from "../_components/BlogForm";
import { productService } from "@/services/product.service";

export default async function CreateBlogPage() {
  const products = await productService.getAllForSelect();

  return (
    <div className="p-6">
      <BlogForm products={products} />
    </div>
  );
}
