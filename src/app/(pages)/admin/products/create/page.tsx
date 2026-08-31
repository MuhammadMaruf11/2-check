"use client";

import ProductForm from "../_components/ProductForm";
import { useProductsForSelect } from "../_hooks/useCategories";

export default function CreateProductPage() {
  const { data: allProducts = [] } = useProductsForSelect();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create Product</h1>
        <p className="text-gray-500 text-sm">
          Fill in the core product details. You&apos;ll be able to add affiliate links, video reviews, and
          expert reviews once the product is created.
        </p>
      </div>
      <ProductForm allProducts={allProducts} />
    </div>
  );
}
