"use client";

import { useQuery } from "@tanstack/react-query";
import { Table, Skeleton, Alert } from "antd";
import { apiClient } from "@/lib/axios";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const { data: subscribers = [], isLoading, isError } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const { data } = await apiClient.get("/newsletter");
      return data as Subscriber[];
    },
  });

  const columns = [
    { title: "Email", dataIndex: "email" },
    { title: "Subscribed", dataIndex: "createdAt", render: (v: string) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Newsletter Subscribers</h1>
        <p className="text-gray-500 text-sm">{subscribers.length} people subscribed.</p>
      </div>

      {isError && <Alert type="error" message="Failed to load subscribers." className="mb-4" />}

      {isLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : (
        <Table rowKey="id" dataSource={subscribers} columns={columns} pagination={{ pageSize: 20 }} locale={{ emptyText: "No subscribers yet" }} />
      )}
    </div>
  );
}
