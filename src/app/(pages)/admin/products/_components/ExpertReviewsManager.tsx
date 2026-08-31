/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button, Card, Table, Modal, Form, Input, InputNumber, Switch, message, Tag, Space } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSubResourceMutation } from "../_hooks/useProductMutation";
import { ExpertReviewItem } from "../_types/product";

const { TextArea } = Input;

export default function ExpertReviewsManager({
  productSlug,
  reviews,
}: {
  productSlug: string;
  reviews: ExpertReviewItem[];
}) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExpertReviewItem | null>(null);
  const { mutateAsync, isPending } = useSubResourceMutation(productSlug, "expert-reviews");

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ displayOrder: reviews.length, isFeatured: false });
    setOpen(true);
  };

  const openEdit = (review: ExpertReviewItem) => {
    setEditing(review);
    form.setFieldsValue(review);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expert review?")) return;
    try {
      await mutateAsync({ id, method: "DELETE" });
      message.success("Expert review deleted");
    } catch {
      message.error("Failed to delete");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await mutateAsync({ id: editing.id, data: values, method: "PATCH" });
        message.success("Expert review updated");
      } else {
        await mutateAsync({ data: values, method: "POST" });
        message.success("Expert review added");
      }
      setOpen(false);
    } catch (e: any) {
      if (e?.response?.data?.error) message.error(e.response.data.error);
    }
  };

  const columns = [
    { title: "Reviewer", dataIndex: "reviewerName" },
    { title: "Role / Publication", dataIndex: "reviewerRole", render: (v: string) => v || "—" },
    { title: "Quote", dataIndex: "quote", ellipsis: true },
    {
      title: "Featured",
      dataIndex: "isFeatured",
      render: (v: boolean) => (v ? <Tag color="gold">Featured</Tag> : null),
    },
    {
      title: "Actions",
      render: (_: any, record: ExpertReviewItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Expert Reviews"
      className="shadow-sm border-none mb-6"
      extra={
        <Button icon={<PlusOutlined />} onClick={openCreate}>
          Add Expert Review
        </Button>
      }
    >
      <Table rowKey="id" dataSource={reviews} columns={columns} pagination={false} locale={{ emptyText: "No expert reviews yet" }} />

      <Modal
        title={editing ? "Edit Expert Review" : "Add Expert Review"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isPending}
        okText={editing ? "Save" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="reviewerName" label="Reviewer Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Nilay Patel" />
          </Form.Item>
          <Form.Item name="reviewerRole" label="Role / Publication (optional)">
            <Input placeholder="Editor, The Verge" />
          </Form.Item>
          <Form.Item name="reviewerAvatar" label="Reviewer Avatar URL (optional)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="quote" label="Quote" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="The camera system is one of the best we've tested this year." />
          </Form.Item>
          <Form.Item name="sourceUrl" label="Source URL (optional)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="rating" label="Rating (0-5, optional)">
            <InputNumber min={0} max={5} step={0.1} style={{ width: "100%" }} />
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
