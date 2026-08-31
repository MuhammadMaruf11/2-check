/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, message, Space, Upload, Input } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import BlogContentEditor from "./BlogContentEditor";
import Image from "next/image";

import FormTextInput from "@/components/ui/FormTextInput";
import FormSelectInput from "@/components/ui/FormSelectInput";
import { BlogFormInput, blogSchema } from "@/schemas/blog.schema";

interface BlogFormProps {
  products?: { id: string; name: string }[];
  initialData?: any;
  /** Where to redirect after a successful save. Defaults to the admin blog list. */
  redirectBasePath?: string;
}

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function BlogForm({
  products = [],
  initialData,
  redirectBasePath = "/admin/blogs",
}: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [submitting, setSubmitting] = useState(false);
  const [slugManual, setSlugManual] = useState(isEdit);

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogFormInput>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      subTitle: initialData?.subTitle ?? "",
      slug: initialData?.slug ?? "",
      content: initialData?.content ?? [],
      tags: initialData?.tags ?? [],
      productIds: initialData?.products?.map((p: any) => p.id) ?? [],
      coverImage: initialData?.coverImage ?? "",
      coverImageFile: null,
      status: initialData?.status ?? "PENDING_REVIEW",
    },
  });

  const slug = watch("slug");
  const coverPreview = watch("coverImage");

  // Cloudinary Upload Logic
  async function uploadToCloudinary(file: File) {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/upload/image", { method: "POST", body: fd });
    const data = await res.json();
    if (!data.success) throw new Error("Image upload failed");
    return data.file.url;
  }

  const onSubmit = async (data: BlogFormInput) => {
  setSubmitting(true);

  try {
    const { coverImageFile, ...rest } = data;

    let coverImageUrl = rest.coverImage;

    // upload cover only if new file selected
    if (coverImageFile instanceof File) {
      coverImageUrl = await uploadToCloudinary(coverImageFile);
    }

    const processedBlocks = await Promise.all(
      rest.content.map(async (block: any) => {
        if (block.type === "image" && block.file instanceof File) {
          const url = await uploadToCloudinary(block.file);
          return { ...block, value: url, file: undefined };
        }
        return block;
      })
    );

    const payload = {
      ...rest,
      coverImage: coverImageUrl,
      content: processedBlocks,
    };

    const res = await fetch(
      isEdit ? `/api/blogs/${initialData!.slug}` : "/api/blogs",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Something went wrong");

    message.success(isEdit ? "Blog updated!" : "Blog created!");
    router.push(redirectBasePath);
  } catch (e: any) {
    message.error(e.message);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <Space orientation="vertical" size="large" className="w-full">
          <Card className="shadow-sm border-none">
            <FormTextInput
              name="title"
              control={control as any}
              label="Title"
              error={errors.title as any}
              onChange={(e: any) => {
                setValue("title", e.target.value);
                if (!slugManual) setValue("slug", toSlug(e.target.value));
              }}
            />
            <FormTextInput
              name="subTitle"
              control={control as any}
              label="Subtitle"
              error={errors.subTitle as any}
            />

            {/* Custom Slug UI */}
            <label className="block text-sm font-medium mb-2">URL Slug</label>
            <Space.Compact className="w-full mb-4">
              <Input value="/blogs/" style={{ width: 80 }} readOnly />
              <Input
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setValue("slug", toSlug(e.target.value));
                }}
              />
            </Space.Compact>
          </Card>

          <Card className="shadow-sm border-none">
            <label className="block text-sm font-medium mb-2">Content</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <BlogContentEditor
                  blocks={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Card>
        </Space>

        <Space orientation="vertical" size="middle" className="w-full">
          <Card title="Cover Image" className="shadow-sm border-none">
            {coverPreview ? (
              <div className="relative border p-2">
                <Image
                  src={coverPreview}
                  alt="Cover"
                  width={400}
                  height={160}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute -top-3 -right-3 z-10">
                  {" "}
                  <Button
                    variant="filled"
                    color="red"
                    icon={<DeleteOutlined />}
                    onClick={() => setValue("coverImage", "")}
                  />
                </div>
              </div>
            ) : (
              <Upload.Dragger
                accept="image/*"
                beforeUpload={(file) => {
                  setValue("coverImage", URL.createObjectURL(file)); // Preview
                  setValue("coverImageFile", file);
                  return false;
                }}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Upload Cover</p>
              </Upload.Dragger>
            )}
          </Card>

          <Card title="Metadata" className="shadow-sm border-none">
            <FormSelectInput
              name="tags"
              control={control as any}
              label="Tags"
              mode="tags"
              options={[]}
              placeholder="Add tags..."
            />
            <FormSelectInput
              name="productIds"
              control={control as any}
              label="Related Products"
              mode="multiple"
              options={products.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Card>

          <Button
            variant="solid"
            color="primary"
            size="large"
            block
            htmlType="submit"
            loading={submitting}
          >
            {isEdit ? "Update Post" : "Save Post"}
          </Button>
        </Space>
      </div>
    </form>
  );
}
