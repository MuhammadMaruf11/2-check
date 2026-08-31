/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Tag, Select, Button, Space, message, Skeleton, Alert } from "antd";
import { apiClient } from "@/lib/axios";
import { GlobalPagination } from "@/components/ui/GlobalPagination";

interface AdminComment {
  id: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  user?: { name?: string | null; email?: string | null } | null;
  guestName?: string | null;
  guestEmail?: string | null;
  blog: { title: string; slug: string };
}

export default function AdminCommentsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-comments", page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ admin: "true", page: String(page) });
      if (filter === "hidden") params.set("hidden", "true");
      const { data } = await apiClient.get(`/comments?${params.toString()}`);
      return data as { comments: AdminComment[]; total: number; totalPages: number };
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/comments/${id}`, { action: "toggleHidden" });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-comments"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/comments/${id}`);
      return data;
    },
    onSuccess: () => {
      message.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
  });

  const columns = [
    { title: "Post", dataIndex: "blog", render: (b: AdminComment["blog"]) => <Link href={`/blog/${b.slug}`}>{b.title}</Link> },
    { title: "Commenter", render: (_: any, r: AdminComment) => r.user?.name || r.guestName || "Anonymous" },
    { title: "Comment", dataIndex: "content", ellipsis: true },
    { title: "Date", dataIndex: "createdAt", render: (v: string) => new Date(v).toLocaleDateString() },
    { title: "Status", dataIndex: "isHidden", render: (v: boolean) => (v ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>) },
    {
      title: "Actions",
      render: (_: any, record: AdminComment) => (
        <Space>
          <Button size="small" onClick={() => toggleMutation.mutate(record.id)} loading={toggleMutation.isPending}>
            {record.isHidden ? "Unhide" : "Hide"}
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              if (confirm("Delete this comment permanently?")) deleteMutation.mutate(record.id);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage Comments</h1>
          <p className="text-gray-500 text-sm">Moderate comments across every blog post.</p>
        </div>
        <Select
          value={filter}
          onChange={(v) => { setFilter(v); setPage(1); }}
          style={{ width: 180 }}
          options={[
            { value: "all", label: "All comments" },
            { value: "hidden", label: "Hidden only" },
          ]}
        />
      </div>

      {isError && <Alert type="error" message="Failed to load comments." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Table rowKey="id" dataSource={data?.comments ?? []} columns={columns} pagination={false} locale={{ emptyText: "No comments found" }} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={20} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
