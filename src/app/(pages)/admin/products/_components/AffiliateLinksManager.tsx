/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button, Card, Table, Modal, Form, Input, InputNumber, Select, Switch, message, Tag, Space } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSubResourceMutation } from "../_hooks/useProductMutation";
import { AffiliateLinkItem } from "../_types/product";

const availabilityOptions = [
  { label: "In Stock", value: "IN_STOCK" },
  { label: "Out of Stock", value: "OUT_OF_STOCK" },
  { label: "Limited Stock", value: "LIMITED_STOCK" },
  { label: "Preorder", value: "PREORDER" },
  { label: "Discontinued", value: "DISCONTINUED" },
];

export default function AffiliateLinksManager({
  productSlug,
  links,
}: {
  productSlug: string;
  links: AffiliateLinkItem[];
}) {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AffiliateLinkItem | null>(null);
  const { mutateAsync, isPending } = useSubResourceMutation(productSlug, "affiliate-links");

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ currency: "USD", availability: "IN_STOCK", isActive: true, displayOrder: links.length });
    setOpen(true);
  };

  const openEdit = (link: AffiliateLinkItem) => {
    setEditing(link);
    form.setFieldsValue({ ...link, price: link.price ? Number(link.price) : undefined });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this affiliate link?")) return;
    try {
      await mutateAsync({ id, method: "DELETE" });
      message.success("Affiliate link deleted");
    } catch {
      message.error("Failed to delete");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await mutateAsync({ id: editing.id, data: values, method: "PATCH" });
        message.success("Affiliate link updated");
      } else {
        await mutateAsync({ data: values, method: "POST" });
        message.success("Affiliate link added");
      }
      setOpen(false);
    } catch (e: any) {
      if (e?.response?.data?.error) message.error(e.response.data.error);
    }
  };

  const columns = [
    { title: "Store", dataIndex: "storeName" },
    {
      title: "Price",
      dataIndex: "price",
      render: (v: any, r: AffiliateLinkItem) => (v ? `${r.currency} ${Number(v).toFixed(2)}` : "—"),
    },
    {
      title: "Availability",
      dataIndex: "availability",
      render: (v: string) => <Tag>{v.replace("_", " ")}</Tag>,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      render: (v: boolean) => (v ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>),
    },
    {
      title: "Actions",
      render: (_: any, record: AffiliateLinkItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Where to Buy — Affiliate Sellers"
      className="shadow-sm border-none mb-6"
      extra={
        <Button icon={<PlusOutlined />} onClick={openCreate}>
          Add Store
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={links}
        columns={columns}
        pagination={false}
        locale={{ emptyText: "No affiliate links yet" }}
      />

      <Modal
        title={editing ? "Edit Affiliate Link" : "Add Affiliate Link"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isPending}
        okText={editing ? "Save" : "Add"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="storeName" label="Store Name" rules={[{ required: true }]}>
            <Input placeholder="Amazon, Best Buy, Walmart..." />
          </Form.Item>
          <Form.Item name="affiliateUrl" label="Affiliate URL" rules={[{ required: true, type: "url" }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="productUrl" label="Original Product URL (optional)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="storeLogo" label="Store Logo URL (optional)">
            <Input placeholder="https://..." />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="price" label="Price" style={{ width: "60%" }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="currency" label="Currency" style={{ width: "40%" }} initialValue="USD">
              <Input />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="availability" label="Availability" initialValue="IN_STOCK">
            <Select options={availabilityOptions} />
          </Form.Item>
          <Form.Item name="trackingId" label="Tracking / Campaign ID (optional)">
            <Input />
          </Form.Item>
          <Form.Item name="displayOrder" label="Display Order" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
