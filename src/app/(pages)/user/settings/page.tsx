"use client";

import { Card, Form, Input, Button, message } from "antd";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export default function UserSettingsPage() {
  const [form] = Form.useForm();

  const mutation = useMutation({
    mutationFn: async (values: { currentPassword: string; newPassword: string }) => {
      const { data } = await apiClient.patch("/profile", { action: "changePassword", ...values });
      return data;
    },
    onSuccess: () => {
      message.success("Password updated successfully");
      form.resetFields();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      message.error(error?.response?.data?.error || "Failed to update password");
    },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-6">Update your account password.</p>

      <Card title="Change Password">
        <Form form={form} layout="vertical" onFinish={(values) => mutation.mutate(values)}>
          <Form.Item name="currentPassword" label="Current Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, min: 8, message: "Must be at least 8 characters" }]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            Update Password
          </Button>
        </Form>
      </Card>
    </div>
  );
}
