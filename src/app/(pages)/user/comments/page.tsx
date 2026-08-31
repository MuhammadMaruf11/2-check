"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Space, message, Skeleton, Alert, Input } from "antd";
import { apiClient } from "@/lib/axios";
import { GlobalPagination } from "@/components/ui/GlobalPagination";

interface MyComment {
  id: string;
  content: string;
  createdAt: string;
  blog: { title: string; slug: string };
}

export default function UserCommentsPage() {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-comments", page],
    queryFn: async () => {
      const { data } = await apiClient.get(`/comments?authored=true&page=${page}`);
      return data as { comments: MyComment[]; total: number; totalPages: number };
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      await apiClient.patch(`/comments/${id}`, { content });
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["my-comments"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/comments/${id}`);
    },
    onSuccess: () => {
      message.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["my-comments"] });
    },
  });

  const columns = [
    { title: "Post", dataIndex: "blog", render: (b: MyComment["blog"]) => <Link href={`/blog/${b.slug}`}>{b.title}</Link> },
    {
      title: "Comment",
      dataIndex: "content",
      render: (v: string, record: MyComment) =>
        editingId === record.id ? (
          <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} onPressEnter={() => editMutation.mutate({ id: record.id, content: editContent })} />
        ) : (
          v
        ),
    },
    { title: "Date", dataIndex: "createdAt", render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: "Actions",
      render: (_: unknown, record: MyComment) =>
        editingId === record.id ? (
          <Space>
            <Button size="small" type="primary" onClick={() => editMutation.mutate({ id: record.id, content: editContent })}>
              Save
            </Button>
            <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
          </Space>
        ) : (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditingId(record.id);
                setEditContent(record.content);
              }}
            >
              Edit
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                if (confirm("Delete this comment?")) deleteMutation.mutate(record.id);
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
      <h1 className="text-2xl font-semibold mb-1">My Comments</h1>
      <p className="text-gray-500 text-sm mb-6">Comments you&apos;ve posted across TechToCheck articles.</p>

      {isError && <Alert type="error" message="Failed to load comments." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Table rowKey="id" dataSource={data?.comments ?? []} columns={columns} pagination={false} locale={{ emptyText: "You haven't commented on anything yet" }} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={20} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
