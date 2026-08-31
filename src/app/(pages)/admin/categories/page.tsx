/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Table, Modal, Form, Input, InputNumber, message, Tag, Space, Skeleton, Alert } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/axios";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
  _count: { products: number };
}

const toSlug = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories");
      return data as Category[];
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ slug, data, method }: { slug?: string; data?: any; method: "POST" | "PATCH" | "DELETE" }) => {
      const url = slug ? `/categories/${slug}` : "/categories";
      const res = await apiClient({ method, url, data });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    form.setFieldsValue(category);
    setOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"? Products in this category will become uncategorized.`)) return;
    try {
      await mutation.mutateAsync({ slug: category.slug, method: "DELETE" });
      message.success("Category deleted");
    } catch {
      message.error("Failed to delete category");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await mutation.mutateAsync({ slug: editing.slug, data: values, method: "PATCH" });
        message.success("Category updated");
      } else {
        await mutation.mutateAsync({ data: values, method: "POST" });
        message.success("Category created");
      }
      setOpen(false);
    } catch (e: any) {
      if (e?.response?.data?.error) message.error(e.response.data.error);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Slug", dataIndex: "slug", render: (v: string) => <Tag>{v}</Tag> },
    { title: "Products", dataIndex: ["_count", "products"] },
    { title: "Order", dataIndex: "displayOrder" },
    {
      title: "Actions",
      render: (_: any, record: Category) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-gray-500 text-sm">Manage the product categories shown across the site.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          New Category
        </Button>
      </div>

      {isError && <Alert type="error" message="Failed to load categories." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table rowKey="id" dataSource={categories} columns={columns} pagination={false} locale={{ emptyText: "No categories yet" }} />
      )}

      <Modal
        title={editing ? "Edit Category" : "New Category"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={mutation.isPending}
        okText={editing ? "Save" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Smartphones"
              onChange={(e) => {
                if (!editing) form.setFieldValue("slug", toSlug(e.target.value));
              }}
            />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input placeholder="smartphones" />
          </Form.Item>
          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="icon" label="Icon URL (optional)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="displayOrder" label="Display Order" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
