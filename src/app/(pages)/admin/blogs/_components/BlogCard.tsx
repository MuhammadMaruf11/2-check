"use client";
import { memo } from "react";
import { Button, Card, Select, Space, Tag } from "antd";
import Image from "next/image";
import { BlogWithAuthor } from "../_types/blog";
import { useRouter } from "next/navigation";
import { useBlogMutation } from "../_hooks/useBlogMutation";

interface BlogCardProps {
  blog: BlogWithAuthor;
  onDelete?: (id: string) => void;
}

const BlogCard = memo(({ blog }: BlogCardProps) => {
  const router = useRouter();
  const { mutate } = useBlogMutation();
  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      mutate({ id, data: {}, method: "DELETE" });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    mutate({ id: blog.slug, data: { status: newStatus }, method: "PATCH" });
  };

  const handleToggleFeatured = () => {
    mutate({ id: blog.slug, data: { action: "toggleFeatured" }, method: "PATCH" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "green";
      case "APPROVED":
        return "blue";
      case "SCHEDULED":
        return "purple";
      case "REJECTED":
        return "red";
      case "DRAFT":
        return "default";
      default:
        return "orange";
    }
  };

  return (
    <Card
      hoverable
      className="w-full shadow-sm"
      cover={
        <Image
          width={300}
          height={200}
          alt={blog.title}
          src={blog.coverImage || "/images/placeholder.webp"}
          className="h-48 object-cover"
        />
      }
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg truncate">{blog.title}</h3>
        <Tag color={getStatusColor(blog.status)}>{blog.status}</Tag>
      </div>

      {blog.isFeatured && <Tag color="gold">Featured</Tag>}

      <p className="text-gray-500 mb-4 text-sm">
        By {blog.author.name || "Anonymous"}
      </p>

      <Space orientation="vertical" className="w-full">
        {/* স্মার্ট স্ট্যাটাস চেঞ্জার ড্রপডাউন */}
        <Select
          defaultValue={blog.status}
          className="w-full"
          onChange={handleStatusChange}
          options={[
            { value: "DRAFT", label: "Draft" },
            { value: "PENDING_REVIEW", label: "Pending Review" },
            { value: "APPROVED", label: "Approved" },
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "PUBLISHED", label: "Published" },
            { value: "REJECTED", label: "Rejected" },
          ]}
        />

        <div className="flex gap-2">
          <Button
            block
            onClick={() => router.push(`/admin/blogs/${blog.slug}`)}
          >
            Edit
          </Button>
          <Button danger block onClick={() => handleDelete(blog.slug)}>
            Delete
          </Button>
        </div>
        <Button block onClick={handleToggleFeatured}>
          {blog.isFeatured ? "Unfeature" : "Feature"}
        </Button>
      </Space>
    </Card>
  );
});

BlogCard.displayName = "BlogCard";
export default BlogCard;
