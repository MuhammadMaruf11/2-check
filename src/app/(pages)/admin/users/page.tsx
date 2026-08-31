/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Table, Select, Switch, message, Skeleton, Alert, Avatar } from "antd";
import { apiClient } from "@/lib/axios";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { GlobalPagination } from "@/components/ui/GlobalPagination";

interface AdminUser {
  id: string;
  name?: string | null;
  email: string;
  role: "USER" | "AUTHOR" | "ADMIN";
  isActive: boolean;
  image?: string | null;
  createdAt: string;
  _count: { blogs: number; comments: number; reviews: number };
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, role, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (role !== "all") params.set("role", role);
      if (search) params.set("search", search);
      const { data } = await apiClient.get(`/users?${params.toString()}`);
      return data as { users: AdminUser[]; total: number; totalPages: number };
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.patch(`/users/${id}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (err: any) => message.error(err?.response?.data?.error || "Failed to update user"),
  });

  const columns = [
    {
      title: "User",
      render: (_: any, record: AdminUser) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.image || undefined}>{(record.name || record.email).charAt(0).toUpperCase()}</Avatar>
          <div>
            <div className="font-medium">{record.name || "—"}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (v: string, record: AdminUser) => (
        <Select
          value={v}
          size="small"
          style={{ width: 120 }}
          disabled={record.id === session?.user.id}
          onChange={(newRole) => mutation.mutate({ id: record.id, data: { role: newRole } })}
          options={[
            { value: "USER", label: "User" },
            { value: "AUTHOR", label: "Author" },
            { value: "ADMIN", label: "Admin" },
          ]}
        />
      ),
    },
    { title: "Posts", dataIndex: ["_count", "blogs"] },
    { title: "Comments", dataIndex: ["_count", "comments"] },
    { title: "Reviews", dataIndex: ["_count", "reviews"] },
    { title: "Joined", dataIndex: "createdAt", render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: "Active",
      dataIndex: "isActive",
      render: (v: boolean, record: AdminUser) => (
        <Switch
          checked={v}
          disabled={record.id === session?.user.id}
          onChange={() => mutation.mutate({ id: record.id, data: { action: "toggleActive" } })}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-gray-500 text-sm">View users and authors, manage roles, and activate or deactivate accounts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <GlobalSearch onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." />
        <Select
          value={role}
          onChange={(v) => { setRole(v); setPage(1); }}
          style={{ width: 160 }}
          options={[
            { value: "all", label: "All roles" },
            { value: "USER", label: "Users" },
            { value: "AUTHOR", label: "Authors" },
            { value: "ADMIN", label: "Admins" },
          ]}
        />
      </div>

      {isError && <Alert type="error" message="Failed to load users." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <Table rowKey="id" dataSource={data?.users ?? []} columns={columns} pagination={false} locale={{ emptyText: "No users found" }} />
          {data && data.totalPages > 1 && (
            <GlobalPagination current={page} total={data.total} pageSize={20} onChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
