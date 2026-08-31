/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Tag, Button, Space, Skeleton, Alert } from "antd";
import { apiClient } from "@/lib/axios";
import { GlobalPagination } from "@/components/ui/GlobalPagination";

interface AuthorComment {
  id: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  user?: { name?: string | null } | null;
  guestName?: string | null;
  blog: { title: string; slug: string };
}

export default function AuthorCommentsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["author-comments", page],
    queryFn: async () => {
      const { data } = await apiClient.get(`/comments?mine=true&page=${page}`);
      return data as { comments: AuthorComment[]; total: number; totalPages: number };
    },
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/comments/${id}`, { action: "toggleHidden" });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["author-comments"] }),
  });

  const columns = [
    { title: "Post", dataIndex: "blog", render: (b: AuthorComment["blog"]) => <Link href={`/blog/${b.slug}`}>{b.title}</Link> },
    { title: "Commenter", render: (_: any, r: AuthorComment) => r.user?.name || r.guestName || "Anonymous" },
    { title: "Comment", dataIndex: "content", ellipsis: true },
    { title: "Status", dataIndex: "isHidden", render: (v: boolean) => (v ? <Tag color="red">Hidden</Tag> : <Tag color="green">Visible</Tag>) },
    {
      title: "Actions",
      render: (_: any, record: AuthorComment) => (
        <Space>
          <Button size="small" onClick={() => mutation.mutate(record.id)} loading={mutation.isPending}>
            {record.isHidden ? "Unhide" : "Hide"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Comments on My Posts</h1>
        <p className="text-gray-500 text-sm">Hide comments that violate community guidelines.</p>
      </div>

      {isError && <Alert type="error" message="Failed to load comments." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Table rowKey="id" dataSource={data?.comments ?? []} columns={columns} pagination={false} locale={{ emptyText: "No comments yet" }} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={20} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
