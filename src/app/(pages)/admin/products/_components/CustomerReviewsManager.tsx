"use client";

import { Card, Table, Tag, Rate, Space, Button, message } from "antd";
import { CheckOutlined, CloseOutlined, StarOutlined, DeleteOutlined } from "@ant-design/icons";
import { useReviewMutation } from "../_hooks/useReviewMutation";
import { CustomerReviewItem } from "../_types/product";

const statusColor: Record<string, string> = {
  PENDING: "orange",
  APPROVED: "green",
  REJECTED: "red",
};

export default function CustomerReviewsManager({
  productSlug,
  reviews,
}: {
  productSlug: string;
  reviews: CustomerReviewItem[];
}) {
  const { mutateAsync, isPending } = useReviewMutation(productSlug);

  const handleModerate = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await mutateAsync({ id, data: { status }, method: "PATCH" });
      message.success(status === "APPROVED" ? "Review approved" : "Review rejected");
    } catch {
      message.error("Failed to update review");
    }
  };

  const handleFeature = async (id: string) => {
    try {
      await mutateAsync({ id, data: { action: "toggleFeature" }, method: "PATCH" });
    } catch {
      message.error("Failed to update review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await mutateAsync({ id, method: "DELETE" });
      message.success("Review deleted");
    } catch {
      message.error("Failed to delete");
    }
  };

  const columns = [
    { title: "User", dataIndex: ["user", "name"], render: (v: string) => v || "Anonymous" },
    { title: "Rating", dataIndex: "rating", render: (v: number) => <Rate disabled defaultValue={v} /> },
    { title: "Title", dataIndex: "title", render: (v: string) => v || "—" },
    { title: "Comment", dataIndex: "comment", ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag>,
    },
    {
      title: "Featured",
      dataIndex: "isFeatured",
      render: (v: boolean) => (v ? <Tag color="gold">Featured</Tag> : null),
    },
    {
      title: "Actions",
      render: (_: unknown, record: CustomerReviewItem) => (
        <Space>
          {record.status !== "APPROVED" && (
            <Button size="small" icon={<CheckOutlined />} onClick={() => handleModerate(record.id, "APPROVED")} loading={isPending}>
              Approve
            </Button>
          )}
          {record.status !== "REJECTED" && (
            <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleModerate(record.id, "REJECTED")} loading={isPending}>
              Reject
            </Button>
          )}
          <Button size="small" icon={<StarOutlined />} onClick={() => handleFeature(record.id)} loading={isPending} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Customer Reviews" className="shadow-sm border-none mb-6">
      <Table
        rowKey="id"
        dataSource={reviews}
        columns={columns}
        pagination={false}
        locale={{ emptyText: "No customer reviews yet" }}
      />
    </Card>
  );
}
