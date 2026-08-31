/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Tag, Button, Space, message, Skeleton, Alert, Modal } from "antd";
import { apiClient } from "@/lib/axios";
import { GlobalPagination } from "@/components/ui/GlobalPagination";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-messages", page],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contact?page=${page}`);
      return data as { messages: ContactMessage[]; total: number; totalPages: number };
    },
  });

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/contact/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/contact/${id}`);
    },
    onSuccess: () => {
      message.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Subject", dataIndex: "subject", render: (v: string) => v || "—" },
    { title: "Date", dataIndex: "createdAt", render: (v: string) => new Date(v).toLocaleDateString() },
    { title: "Status", dataIndex: "isRead", render: (v: boolean) => (v ? <Tag>Read</Tag> : <Tag color="blue">Unread</Tag>) },
    {
      title: "Actions",
      render: (_: any, record: ContactMessage) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setViewing(record);
              if (!record.isRead) readMutation.mutate(record.id);
            }}
          >
            View
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              if (confirm("Delete this message?")) deleteMutation.mutate(record.id);
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-gray-500 text-sm">Contact form submissions from visitors.</p>
      </div>

      {isError && <Alert type="error" message="Failed to load messages." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Table rowKey="id" dataSource={data?.messages ?? []} columns={columns} pagination={false} locale={{ emptyText: "No messages yet" }} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={20} onChange={setPage} />
          )}
        </>
      )}

      <Modal title={viewing?.subject || "Message"} open={!!viewing} onCancel={() => setViewing(null)} footer={null}>
        {viewing && (
          <div>
            <p className="text-sm text-gray-500">
              From {viewing.name} ({viewing.email}) — {new Date(viewing.createdAt).toLocaleString()}
            </p>
            <p className="mt-4 whitespace-pre-line">{viewing.message}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
