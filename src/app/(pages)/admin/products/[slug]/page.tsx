"use client";

import { use } from "react";
import { Skeleton, Alert, Tabs } from "antd";
import { useAdminProduct } from "../_hooks/useProducts";
import { useProductsForSelect } from "../_hooks/useCategories";
import ProductForm from "../_components/ProductForm";
import AffiliateLinksManager from "../_components/AffiliateLinksManager";
import VideoReviewsManager from "../_components/VideoReviewsManager";
import ExpertReviewsManager from "../_components/ExpertReviewsManager";
import CustomerReviewsManager from "../_components/CustomerReviewsManager";

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: product, isLoading, isError } = useAdminProduct(slug);
  const { data: allProducts = [] } = useProductsForSelect();

  if (isLoading) return <Skeleton active paragraph={{ rows: 12 }} />;
  if (isError || !product) return <Alert type="error" message="Product not found." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-gray-500 text-sm">/products/{product.slug}</p>
      </div>

      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: "general",
            label: "General",
            children: <ProductForm initialData={product} allProducts={allProducts} />,
          },
          {
            key: "affiliate",
            label: `Affiliate Links (${product.affiliateLinks.length})`,
            children: <AffiliateLinksManager productSlug={product.slug} links={product.affiliateLinks} />,
          },
          {
            key: "videos",
            label: `Video Reviews (${product.videoReviews.length})`,
            children: <VideoReviewsManager productSlug={product.slug} videos={product.videoReviews} />,
          },
          {
            key: "expert",
            label: `Expert Reviews (${product.expertReviews.length})`,
            children: <ExpertReviewsManager productSlug={product.slug} reviews={product.expertReviews} />,
          },
          {
            key: "customer",
            label: `Customer Reviews (${product.customerReviews.length})`,
            children: <CustomerReviewsManager productSlug={product.slug} reviews={product.customerReviews} />,
          },
        ]}
      />
    </div>
  );
}
