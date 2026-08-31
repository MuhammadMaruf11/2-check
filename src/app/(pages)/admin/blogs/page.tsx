"use client";
import { useState } from "react";
import BlogList from "./_components/BlogList";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { GlobalPagination } from "@/components/ui/GlobalPagination";
import { Button, Spin } from "antd";
import { useBlogs } from "./_hooks/useBlogs";
import { useRouter } from "next/navigation";

export default function AdminBlogPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useBlogs(page, search);

  if (isError) return <div>Error loading blogs</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blogs</h1>
      </div>
      <div className="flex justify-between items-center mb-4">
        <GlobalSearch
          placeholder="Search blogs..."
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />
        <Button
          type="primary"
          className="bg-primary!"
          onClick={() => router.push("/admin/blogs/create")}
        >
          New Blog
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <BlogList blogs={data?.blogs || []} onDelete={() => {}} />
          <GlobalPagination
            current={page}
            total={data?.total || 0}
            pageSize={12}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
