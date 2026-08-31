"use client";

import { Table, Tag, Switch, Button, Space, message, Avatar } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useProductMutation } from "../_hooks/useProductMutation";
import { AdminProduct } from "../_types/product";

export default function ProductList({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const { mutateAsync } = useProductMutation();

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this product permanently? This cannot be undone.")) return;
    try {
      await mutateAsync({ slug, method: "DELETE" });
      message.success("Product deleted");
    } catch {
      message.error("Failed to delete product");
    }
  };

  const handleTogglePublish = async (slug: string) => {
    try {
      await mutateAsync({ slug, data: { action: "togglePublish" }, method: "PATCH" });
    } catch {
      message.error("Failed to update product");
    }
  };

  const handleToggleFeatured = async (slug: string) => {
    try {
      await mutateAsync({ slug, data: { action: "toggleFeatured" }, method: "PATCH" });
    } catch {
      message.error("Failed to update product");
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      render: (name: string, record: AdminProduct) => (
        <div className="flex items-center gap-2">
          <Avatar shape="square" src={record.thumbnailUrl || undefined} size={40}>
            {name.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-400">{record.brand}</div>
          </div>
        </div>
      ),
    },
    { title: "Category", dataIndex: ["category", "name"], render: (v: string) => v || <Tag>Uncategorized</Tag> },
    {
      title: "Price",
      dataIndex: "price",
      render: (v: number | string | null, r: AdminProduct) => (v ? `${r.currency} ${Number(v).toFixed(2)}` : "—"),
    },
    { title: "Rating", dataIndex: "rating", render: (v: number, r: AdminProduct) => `${v.toFixed(1)} (${r.ratingCount})` },
    {
      title: "Published",
      dataIndex: "isPublished",
      render: (v: boolean, r: AdminProduct) => (
        <Switch checked={v} onChange={() => handleTogglePublish(r.slug)} />
      ),
    },
    {
      title: "Featured",
      dataIndex: "isFeatured",
      render: (v: boolean, r: AdminProduct) => (
        <Switch checked={v} onChange={() => handleToggleFeatured(r.slug)} />
      ),
    },
    {
      title: "Actions",
      render: (_: unknown, record: AdminProduct) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => router.push(`/admin/products/${record.slug}`)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.slug)} />
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={products}
      columns={columns}
      pagination={false}
      locale={{ emptyText: "No products yet" }}
    />
  );
}
