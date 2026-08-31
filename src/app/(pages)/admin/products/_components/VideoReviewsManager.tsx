/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button, Card, Table, Modal, Form, Input, InputNumber, Switch, message, Tag, Space } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSubResourceMutation } from "../_hooks/useProductMutation";
import { VideoReviewItem } from "../_types/product";

export default function VideoReviewsManager({
  productSlug,
  videos,
}: {
  productSlug: string;
  videos: VideoReviewItem[];
}) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VideoReviewItem | null>(null);
  const { mutateAsync, isPending } = useSubResourceMutation(productSlug, "videos");

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ displayOrder: videos.length, isFeatured: false });
    setOpen(true);
  };

  const openEdit = (video: VideoReviewItem) => {
    setEditing(video);
    form.setFieldsValue(video);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video review?")) return;
    try {
      await mutateAsync({ id, method: "DELETE" });
      message.success("Video review deleted");
    } catch {
      message.error("Failed to delete");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await mutateAsync({ id: editing.id, data: values, method: "PATCH" });
        message.success("Video review updated");
      } else {
        await mutateAsync({ data: values, method: "POST" });
        message.success("Video review added");
      }
      setOpen(false);
    } catch (e: any) {
      if (e?.response?.data?.error) message.error(e.response.data.error);
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Reviewer", dataIndex: "reviewerName", render: (v: string) => v || "TechToCheck" },
    {
      title: "Featured",
      dataIndex: "isFeatured",
      render: (v: boolean) => (v ? <Tag color="gold">Featured</Tag> : null),
    },
    {
      title: "Actions",
      render: (_: any, record: VideoReviewItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Video Reviews"
      className="shadow-sm border-none mb-6"
      extra={
        <Button icon={<PlusOutlined />} onClick={openCreate}>
          Add Video
        </Button>
      }
    >
      <Table rowKey="id" dataSource={videos} columns={columns} pagination={false} locale={{ emptyText: "No video reviews yet" }} />

      <Modal
        title={editing ? "Edit Video Review" : "Add Video Review"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isPending}
        okText={editing ? "Save" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Our Full Review, Camera Test, ..." />
          </Form.Item>
          <Form.Item name="youtubeUrl" label="YouTube URL" rules={[{ required: true, type: "url" }]}>
            <Input placeholder="https://www.youtube.com/watch?v=..." />
          </Form.Item>
          <Form.Item name="reviewerName" label="Reviewer / Channel (optional)">
            <Input placeholder="TechToCheck, Marques Brownlee, Mrwhosetheboss..." />
          </Form.Item>
          <Form.Item name="reviewerChannelUrl" label="Reviewer Channel URL (optional)">
            <Input placeholder="https://youtube.com/@..." />
          </Form.Item>
          <Form.Item name="displayOrder" label="Display Order" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isFeatured" label="Featured" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
