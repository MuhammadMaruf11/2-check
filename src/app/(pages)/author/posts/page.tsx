/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Tag, Select, Button, Space, message, Skeleton, Alert } from "antd";
import { apiClient } from "@/lib/axios";
import { GlobalPagination } from "@/components/ui/GlobalPagination";

interface AuthorBlog {
  id: string;
  slug: string;
  title: string;
  status: string;
  createdAt: string;
  publishedAt?: string | null;
}

const statusColor: Record<string, string> = {
  DRAFT: "default",
  PENDING_REVIEW: "orange",
  APPROVED: "blue",
  SCHEDULED: "purple",
  PUBLISHED: "green",
  REJECTED: "red",
};

export default function AuthorPostsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["author-posts", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ mine: "true", page: String(page), limit: "10" });
      if (status !== "all") params.set("status", status);
      const { data } = await apiClient.get(`/blogs?${params.toString()}`);
      return data as { blogs: AuthorBlog[]; total: number; totalPages: number };
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ slug, data, method }: { slug: string; data?: any; method: "PATCH" | "DELETE" }) => {
      const res = await apiClient({ method, url: `/blogs/${slug}`, data });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["author-posts"] }),
  });

  const handleSubmitForReview = (slug: string) => {
    mutation.mutate(
      { slug, data: { status: "PENDING_REVIEW" }, method: "PATCH" },
      { onSuccess: () => message.success("Submitted for review!") },
    );
  };

  const handleDelete = (slug: string) => {
    if (!confirm("Delete this post?")) return;
    mutation.mutate({ slug, method: "DELETE" }, { onSuccess: () => message.success("Deleted") });
  };

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Status", dataIndex: "status", render: (v: string) => <Tag color={statusColor[v]}>{v.replace("_", " ")}</Tag> },
    { title: "Created", dataIndex: "createdAt", render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: "Actions",
      render: (_: any, record: AuthorBlog) => (
        <Space>
          <Link href={`/author/posts/${record.slug}`}>
            <Button size="small">Edit</Button>
          </Link>
          {record.status === "DRAFT" && (
            <Button size="small" type="primary" onClick={() => handleSubmitForReview(record.slug)}>
              Submit for Review
            </Button>
          )}
          {["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(record.status) && (
            <Button size="small" danger onClick={() => handleDelete(record.slug)}>
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Posts</h1>
          <p className="text-gray-500 text-sm">Manage your drafts and track their review status.</p>
        </div>
        <Space>
          <Select
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            style={{ width: 180 }}
            options={[
              { value: "all", label: "All statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "PENDING_REVIEW", label: "Pending Review" },
              { value: "APPROVED", label: "Approved" },
              { value: "SCHEDULED", label: "Scheduled" },
              { value: "PUBLISHED", label: "Published" },
              { value: "REJECTED", label: "Rejected" },
            ]}
          />
          <Link href="/author/posts/create">
            <Button type="primary">New Post</Button>
          </Link>
        </Space>
      </div>

      {isError && <Alert type="error" message="Failed to load posts." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Table rowKey="id" dataSource={data?.blogs ?? []} columns={columns} pagination={false} locale={{ emptyText: "You haven't written anything yet" }} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={10} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
