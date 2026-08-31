/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Table, Modal, Form, Input, Upload, message, Space, Skeleton, Alert } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/axios";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
}

const toSlug = (s: string) => s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

async function uploadToCloudinary(file: File) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch("/api/upload/image", { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");
  return data.file.url as string;
}

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: news = [], isLoading, isError } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data } = await apiClient.get("/news");
      return data as NewsItem[];
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ slug, data, method }: { slug?: string; data?: any; method: "POST" | "PATCH" | "DELETE" }) => {
      const url = slug ? `/news/${slug}` : "/news";
      const res = await apiClient({ method, url, data });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-news"] }),
  });

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditing(item);
    form.setFieldsValue(item);
    setOpen(true);
  };

  const handleDelete = async (item: NewsItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await mutation.mutateAsync({ slug: item.slug, method: "DELETE" });
      message.success("Deleted");
    } catch {
      message.error("Failed to delete");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await mutation.mutateAsync({ slug: editing.slug, data: values, method: "PATCH" });
        message.success("Updated");
      } else {
        await mutation.mutateAsync({ data: values, method: "POST" });
        message.success("Created");
      }
      setOpen(false);
    } catch (e: any) {
      if (e?.response?.data?.error) message.error(e.response.data.error);
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Slug", dataIndex: "slug" },
    { title: "Date", dataIndex: "createdAt", render: (v: string) => new Date(v).toLocaleDateString() },
    {
      title: "Actions",
      render: (_: any, record: NewsItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">News</h1>
          <p className="text-gray-500 text-sm">Manage short news announcements.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          New Item
        </Button>
      </div>

      {isError && <Alert type="error" message="Failed to load news." className="mb-4" />}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table rowKey="id" dataSource={news} columns={columns} pagination={false} locale={{ emptyText: "No news items yet" }} />
      )}

      <Modal
        title={editing ? "Edit News" : "New News Item"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={mutation.isPending}
        okText={editing ? "Save" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true }]}
          >
            <Input onChange={(e) => { if (!editing) form.setFieldValue("slug", toSlug(e.target.value)); }} />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image (optional)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Upload.Dragger
            accept="image/*"
            showUploadList={false}
            disabled={uploading}
            beforeUpload={async (file) => {
              setUploading(true);
              try {
                const url = await uploadToCloudinary(file);
                form.setFieldValue("imageUrl", url);
                message.success("Image uploaded");
              } catch {
                message.error("Upload failed");
              } finally {
                setUploading(false);
              }
              return false;
            }}
          >
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">{uploading ? "Uploading..." : "Or upload an image"}</p>
          </Upload.Dragger>
        </Form>
      </Modal>
    </div>
  );
}
