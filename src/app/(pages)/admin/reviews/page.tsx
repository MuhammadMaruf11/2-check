/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Tag, Rate, Space, Button, message, Select, Skeleton, Alert, Avatar } from "antd";
import { CheckOutlined, CloseOutlined, StarOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import { apiClient } from "@/lib/axios";
import { GlobalPagination } from "@/components/ui/GlobalPagination";

interface AdminReview {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isFeatured: boolean;
  createdAt: string;
  user: { name?: string | null; email?: string | null; image?: string | null };
  product: { name: string; slug: string; thumbnailUrl?: string | null };
}

const statusColor: Record<string, string> = { PENDING: "orange", APPROVED: "green", REJECTED: "red" };

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-reviews", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ admin: "true", page: String(page), limit: "20" });
      if (status !== "all") params.set("status", status);
      const { data } = await apiClient.get(`/reviews?${params.toString()}`);
      return data as { reviews: AdminReview[]; total: number; totalPages: number };
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data, method }: { id: string; data?: any; method: "PATCH" | "DELETE" }) => {
      const res = await apiClient({ method, url: `/reviews/${id}`, data });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      render: (p: AdminReview["product"]) => (
        <Link href={`/admin/products/${p.slug}`} className="flex items-center gap-2">
          <Avatar shape="square" src={p.thumbnailUrl || undefined} size={32}>
            {p.name.charAt(0)}
          </Avatar>
          <span className="text-sm">{p.name}</span>
        </Link>
      ),
    },
    { title: "User", dataIndex: "user", render: (u: AdminReview["user"]) => u?.name || u?.email || "Anonymous" },
    { title: "Rating", dataIndex: "rating", render: (v: number) => <Rate disabled defaultValue={v} /> },
    { title: "Comment", dataIndex: "comment", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag> },
    {
      title: "Actions",
      render: (_: any, record: AdminReview) => (
        <Space>
          {record.status !== "APPROVED" && (
            <Button size="small" icon={<CheckOutlined />} onClick={() => mutation.mutate({ id: record.id, data: { status: "APPROVED" }, method: "PATCH" })}>
              Approve
            </Button>
          )}
          {record.status !== "REJECTED" && (
            <Button size="small" danger icon={<CloseOutlined />} onClick={() => mutation.mutate({ id: record.id, data: { status: "REJECTED" }, method: "PATCH" })}>
              Reject
            </Button>
          )}
          <Button size="small" icon={<StarOutlined />} onClick={() => mutation.mutate({ id: record.id, data: { action: "toggleFeature" }, method: "PATCH" })} />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (confirm("Delete this review permanently?")) {
                mutation.mutate({ id: record.id, method: "DELETE" }, { onSuccess: () => message.success("Deleted") });
              }
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Reviews</h1>
          <p className="text-gray-500 text-sm">Moderate customer reviews submitted across all products.</p>
        </div>
        <Select
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          style={{ width: 180 }}
          options={[
            { value: "all", label: "All statuses" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ]}
        />
      </div>

      {isError && <Alert type="error" message="Failed to load reviews." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <Table rowKey="id" dataSource={data?.reviews ?? []} columns={columns} pagination={false} locale={{ emptyText: "No reviews found" }} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={20} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
