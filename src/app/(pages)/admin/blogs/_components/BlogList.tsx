"use client";
import { Row, Col, Empty } from "antd";
import BlogCard from "./BlogCard"; // আগে বানানো কম্পোনেন্ট
import { BlogWithAuthor } from "../_types/blog";

interface BlogListProps {
  blogs: BlogWithAuthor[];
  onDelete: (id: string) => void;
}

export default function BlogList({ blogs, onDelete }: BlogListProps) {
  if (blogs.length === 0) return <Empty description="No blogs found" />;

  return (
    <Row gutter={[16, 16]}>
      {blogs.map((blog) => (
        <Col xs={24} sm={12} md={8} lg={6} key={blog.id}>
          <BlogCard blog={blog} onDelete={onDelete} />
        </Col>
      ))}
    </Row>
  );
}
