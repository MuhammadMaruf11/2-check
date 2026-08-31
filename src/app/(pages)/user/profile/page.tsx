"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Form, Input, Button, Avatar, message, Upload, Skeleton } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/axios";
import { useSession } from "next-auth/react";

async function uploadToCloudinary(file: File) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch("/api/upload/image", { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");
  return data.file.url as string;
}

export default function UserProfilePage() {
  const { update: updateSession } = useSession();
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data } = await apiClient.get("/profile");
      return data as { id: string; name?: string | null; email: string; image?: string | null; role: string };
    },
  });

  useEffect(() => {
    if (profile) form.setFieldsValue(profile);
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: async (values: { name?: string; image?: string }) => {
      const { data } = await apiClient.patch("/profile", values);
      return data;
    },
    onSuccess: async () => {
      message.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await updateSession();
    },
  });

  if (isLoading) return <Skeleton active avatar paragraph={{ rows: 4 }} />;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-1">Profile</h1>
      <p className="text-gray-500 text-sm mb-6">Manage how your name and photo appear on TechToCheck.</p>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Avatar size={64} src={form.getFieldValue("image") || undefined} icon={<UserOutlined />} />
          <Upload
            accept="image/*"
            showUploadList={false}
            disabled={uploading}
            beforeUpload={async (file) => {
              setUploading(true);
              try {
                const url = await uploadToCloudinary(file);
                form.setFieldValue("image", url);
                message.success("Photo uploaded - remember to save");
              } catch {
                message.error("Upload failed");
              } finally {
                setUploading(false);
              }
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Change Photo
            </Button>
          </Upload>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate({ name: values.name, image: form.getFieldValue("image") })}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter your name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            Save Changes
          </Button>
        </Form>
      </Card>
    </div>
  );
}
