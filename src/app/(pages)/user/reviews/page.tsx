"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Tag, Rate, Button, message, Skeleton, Alert } from "antd";
import { apiClient } from "@/lib/axios";
import { GlobalPagination } from "@/components/ui/GlobalPagination";

interface MyReview {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  product: { name: string; slug: string };
}

const statusColor: Record<string, string> = { PENDING: "orange", APPROVED: "green", REJECTED: "red" };

export default function UserReviewsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-reviews", page],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reviews?mine=true&page=${page}`);
      return data as { reviews: MyReview[]; total: number; totalPages: number };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/reviews/${id}`);
    },
    onSuccess: () => {
      message.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
    },
  });

  const columns = [
    { title: "Product", dataIndex: "product", render: (p: MyReview["product"]) => <Link href={`/products/${p.slug}`}>{p.name}</Link> },
    { title: "Rating", dataIndex: "rating", render: (v: number) => <Rate disabled defaultValue={v} /> },
    { title: "Comment", dataIndex: "comment", ellipsis: true },
    { title: "Status", dataIndex: "status", render: (v: string) => <Tag color={statusColor[v]}>{v}</Tag> },
    {
      title: "Actions",
      render: (_: unknown, record: MyReview) => (
        <Button
          size="small"
          danger
          onClick={() => {
            if (confirm("Delete this review?")) deleteMutation.mutate(record.id);
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">My Reviews</h1>
      <p className="text-gray-500 text-sm mb-6">Reviews you&apos;ve submitted, and their moderation status.</p>

      {isError && <Alert type="error" message="Failed to load reviews." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Table rowKey="id" dataSource={data?.reviews ?? []} columns={columns} pagination={false} locale={{ emptyText: "You haven't reviewed any products yet" }} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={20} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
