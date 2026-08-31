"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Select, Skeleton, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { GlobalPagination } from "@/components/ui/GlobalPagination";
import { useAdminProducts } from "./_hooks/useProducts";
import ProductList from "./_components/ProductList";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const { data, isLoading, isError } = useAdminProducts(page, search, status);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-gray-500 text-sm">Manage the product catalog, pricing, and publishing status.</p>
        </div>
        <Link href="/admin/products/create">
          <Button type="primary" icon={<PlusOutlined />}>
            New Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <GlobalSearch onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search products by name or brand..." />
        <Select
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          style={{ width: 180 }}
          options={[
            { value: "all", label: "All statuses" },
            { value: "published", label: "Published only" },
            { value: "unpublished", label: "Unpublished only" },
          ]}
        />
      </div>

      {isError && <Alert type="error" message="Failed to load products." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <ProductList products={data?.products ?? []} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={12} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
