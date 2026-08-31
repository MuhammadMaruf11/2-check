/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, message, Space, Upload, Input, Row, Col, Divider } from "antd";
import { UploadOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Image from "next/image";

import FormTextInput from "@/components/ui/FormTextInput";
import FormTextArea from "@/components/ui/FormTextArea";
import FormSelectInput from "@/components/ui/FormSelectInput";
import FormNumberInput from "@/components/ui/FormNumberInput";
import FormSwitchInput from "@/components/ui/FormSwitchInput";
import FormDatePicker from "@/components/ui/FormDatePicker";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { productSchema, ProductFormInput } from "@/schemas/product.schema";
import { useCategories } from "../_hooks/useCategories";
import { useProductMutation } from "../_hooks/useProductMutation";
import { AdminProduct } from "../_types/product";

interface ProductFormProps {
  initialData?: AdminProduct;
  allProducts?: { id: string; name: string }[];
}

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

async function uploadToCloudinary(file: File) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch("/api/upload/image", { method: "POST", body: fd });
  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");
  return data.file.url as string;
}

export default function ProductForm({ initialData, allProducts = [] }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [submitting, setSubmitting] = useState(false);
  const [slugManual, setSlugManual] = useState(isEdit);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const { data: categories = [] } = useCategories();
  const { mutateAsync } = useProductMutation();

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      slug: initialData?.slug ?? "",
      name: initialData?.name ?? "",
      brand: initialData?.brand ?? "",
      categoryId: initialData?.categoryId ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      longDescription: initialData?.longDescription ?? "",
      verdict: initialData?.verdict ?? "",
      thumbnailUrl: initialData?.thumbnailUrl ?? "",
      imageUrls: initialData?.imageUrls ?? [],
      pros: initialData?.pros ?? [],
      cons: initialData?.cons ?? [],
      specifications: initialData?.specifications?.map((s) => ({
        groupName: s.groupName ?? "",
        label: s.label,
        value: s.value,
        displayOrder: s.displayOrder,
      })) ?? [],
      price: initialData?.price ? Number(initialData.price) : undefined,
      originalPrice: initialData?.originalPrice ? Number(initialData.originalPrice) : undefined,
      currency: initialData?.currency ?? "USD",
      releaseDate: initialData?.releaseDate ?? undefined,
      isFeatured: initialData?.isFeatured ?? false,
      isPublished: initialData?.isPublished ?? false,
      seoTitle: initialData?.seoTitle ?? "",
      seoDescription: initialData?.seoDescription ?? "",
      seoKeywords: initialData?.seoKeywords ?? [],
      relatedProductIds: initialData?.relatedTo?.map((p) => p.id) ?? [],
    },
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specifications",
  });

  const slug = watch("slug");
  const thumbnailUrl = watch("thumbnailUrl");
  const imageUrls = watch("imageUrls") || [];

  const onSubmit = async (data: ProductFormInput) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        price: data.price ?? null,
        originalPrice: data.originalPrice ?? null,
      };

      if (isEdit) {
        await mutateAsync({ slug: initialData!.slug, data: payload, method: "PATCH" });
        message.success("Product updated!");
        if (payload.slug !== initialData!.slug) {
          router.push(`/admin/products/${payload.slug}`);
        }
      } else {
        const created = await mutateAsync({ data: payload, method: "POST" });
        message.success("Product created! Add affiliate links, videos, and expert reviews now.");
        router.push(`/admin/products/${created.slug}`);
      }
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <Space orientation="vertical" size="large" className="w-full">
          <Card title="Basic Information" className="shadow-sm border-none">
            <Row gutter={16}>
              <Col span={16}>
                <FormTextInput
                  name="name"
                  control={control as any}
                  label="Product Name"
                  error={errors.name as any}
                  onChange={(e: any) => {
                    setValue("name", e.target.value);
                    if (!slugManual) setValue("slug", toSlug(e.target.value));
                  }}
                />
              </Col>
              <Col span={8}>
                <FormTextInput name="brand" control={control as any} label="Brand" error={errors.brand as any} />
              </Col>
            </Row>

            <label className="block text-sm font-medium mb-2">URL Slug</label>
            <Space.Compact className="w-full mb-4">
              <Input value="/products/" style={{ width: 100 }} readOnly />
              <Input
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setValue("slug", toSlug(e.target.value));
                }}
              />
            </Space.Compact>

            <FormSelectInput
              name="categoryId"
              control={control as any}
              label="Category"
              showSearch
              optionFilterProp="label"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              placeholder="Select category"
            />

            <FormTextArea
              name="shortDescription"
              control={control as any}
              label="Short Description"
              placeholder="One or two sentences shown on cards and hero sections"
              rows={2}
              error={errors.shortDescription as any}
            />
            <label className="block text-sm font-medium mb-2">Full Description</label>
            <Controller
              name="longDescription"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value || ""} onChange={field.onChange} />
              )}
            />
            {errors.longDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.longDescription.message as string}</p>
            )}
            <div className="mt-4" />
            <FormTextArea
              name="verdict"
              control={control as any}
              label="Our Verdict"
              placeholder="Editorial closing verdict shown near the bottom of the product page"
              rows={3}
            />
          </Card>

          <Card title="Pros & Cons" className="shadow-sm border-none">
            <Row gutter={16}>
              <Col span={12}>
                <FormSelectInput
                  name="pros"
                  control={control as any}
                  label="Pros"
                  mode="tags"
                  options={[]}
                  placeholder="Type a pro and press enter"
                />
              </Col>
              <Col span={12}>
                <FormSelectInput
                  name="cons"
                  control={control as any}
                  label="Cons"
                  mode="tags"
                  options={[]}
                  placeholder="Type a con and press enter"
                />
              </Col>
            </Row>
          </Card>

          <Card
            title="Specifications"
            className="shadow-sm border-none"
            extra={
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => appendSpec({ groupName: "", label: "", value: "", displayOrder: specFields.length })}
              >
                Add Row
              </Button>
            }
          >
            {specFields.length === 0 && (
              <p className="text-gray-400 text-sm mb-2">No specifications yet. Add a row to get started.</p>
            )}
            {specFields.map((field, index) => (
              <Row gutter={8} key={field.id} className="mb-2" align="middle">
                <Col span={6}>
                  <Controller
                    name={`specifications.${index}.groupName`}
                    control={control}
                    render={({ field: f }) => <Input {...f} placeholder="Group (e.g. Display)" />}
                  />
                </Col>
                <Col span={7}>
                  <Controller
                    name={`specifications.${index}.label`}
                    control={control}
                    render={({ field: f }) => <Input {...f} placeholder="Label (e.g. Screen Size)" />}
                  />
                </Col>
                <Col span={9}>
                  <Controller
                    name={`specifications.${index}.value`}
                    control={control}
                    render={({ field: f }) => <Input {...f} placeholder="Value (e.g. 6.7 inch)" />}
                  />
                </Col>
                <Col span={2}>
                  <Button danger icon={<DeleteOutlined />} onClick={() => removeSpec(index)} />
                </Col>
              </Row>
            ))}
          </Card>

          <Card title="SEO" className="shadow-sm border-none">
            <FormTextInput name="seoTitle" control={control as any} label="SEO Title" />
            <FormTextArea name="seoDescription" control={control as any} label="SEO Description" rows={2} />
            <FormSelectInput
              name="seoKeywords"
              control={control as any}
              label="SEO Keywords"
              mode="tags"
              options={[]}
              placeholder="Add keywords..."
            />
          </Card>
        </Space>

        <Space orientation="vertical" size="middle" className="w-full">
          <Card title="Thumbnail" className="shadow-sm border-none">
            {thumbnailUrl ? (
              <div className="relative border p-2">
                <Image
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  width={400}
                  height={220}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute -top-3 -right-3 z-10">
                  <Button
                    variant="filled"
                    color="red"
                    icon={<DeleteOutlined />}
                    onClick={() => setValue("thumbnailUrl", "")}
                  />
                </div>
              </div>
            ) : (
              <Upload.Dragger
                accept="image/*"
                showUploadList={false}
                disabled={uploadingThumb}
                beforeUpload={async (file) => {
                  setUploadingThumb(true);
                  try {
                    const url = await uploadToCloudinary(file);
                    setValue("thumbnailUrl", url);
                  } catch {
                    message.error("Thumbnail upload failed");
                  } finally {
                    setUploadingThumb(false);
                  }
                  return false;
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">{uploadingThumb ? "Uploading..." : "Upload Thumbnail"}</p>
              </Upload.Dragger>
            )}
          </Card>

          <Card title="Gallery Images" className="shadow-sm border-none">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {imageUrls.map((url, i) => (
                <div className="relative border p-1" key={url + i}>
                  <Image src={url} alt={`Gallery ${i}`} width={120} height={90} className="w-full h-20 object-cover" />
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    className="absolute top-0 right-0"
                    onClick={() =>
                      setValue(
                        "imageUrls",
                        imageUrls.filter((_, idx) => idx !== i),
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <Upload.Dragger
              accept="image/*"
              multiple
              showUploadList={false}
              disabled={uploadingGallery}
              beforeUpload={async (file) => {
                setUploadingGallery(true);
                try {
                  const url = await uploadToCloudinary(file);
                  setValue("imageUrls", [...(watch("imageUrls") || []), url]);
                } catch {
                  message.error("Image upload failed");
                } finally {
                  setUploadingGallery(false);
                }
                return false;
              }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">{uploadingGallery ? "Uploading..." : "Add Gallery Image"}</p>
            </Upload.Dragger>
          </Card>

          <Card title="Pricing" className="shadow-sm border-none">
            <Row gutter={12}>
              <Col span={12}>
                <FormNumberInput name="price" control={control as any} label="Price" min={0} />
              </Col>
              <Col span={12}>
                <FormNumberInput name="originalPrice" control={control as any} label="Original Price" min={0} />
              </Col>
            </Row>
            <FormTextInput name="currency" control={control as any} label="Currency" placeholder="USD" />
            <FormDatePicker name="releaseDate" control={control as any} label="Release Date" />
          </Card>

          <Card title="Related Products" className="shadow-sm border-none">
            <FormSelectInput
              name="relatedProductIds"
              control={control as any}
              label="Related Products"
              mode="multiple"
              showSearch
              optionFilterProp="label"
              options={allProducts
                .filter((p) => p.id !== initialData?.id)
                .map((p) => ({ label: p.name, value: p.id }))}
            />
          </Card>

          <Card title="Status" className="shadow-sm border-none">
            <FormSwitchInput name="isPublished" control={control as any} label="Published" />
            <FormSwitchInput name="isFeatured" control={control as any} label="Featured" />
          </Card>

          <Button variant="solid" color="primary" size="large" block htmlType="submit" loading={submitting}>
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </Space>
      </div>

      {isEdit && (
        <Divider className="mt-8">
          <span className="text-gray-400 text-sm">
            Manage affiliate links, video reviews, expert reviews, and customer reviews below
          </span>
        </Divider>
      )}
    </form>
  );
}
