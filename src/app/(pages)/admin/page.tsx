"use client";

import Link from "next/link";
import { Card, Row, Col, Statistic, Tag } from "antd";
import {
  ShoppingOutlined,
  ReadOutlined,
  TeamOutlined,
  CommentOutlined,
  StarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const statusColor: Record<string, string> = {
  DRAFT: "default",
  PENDING_REVIEW: "orange",
  APPROVED: "blue",
  SCHEDULED: "purple",
  PUBLISHED: "green",
  REJECTED: "red",
};

interface DashboardClientProps {
  statsData?: {
    totalProducts: number;
    publishedProducts: number;
    featuredProducts: number;
    totalBlogs: number;
    publishedBlogs: number;
    pendingBlogs: number;
    draftBlogs: number;
    totalUsers: number;
    totalAuthors: number;
    totalComments: number;
    totalReviews: number;
    pendingReviews: number;
  };
  recentBlogs?: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    author: { name: string | null } | null;
  }>;
  recentReviews?: Array<{
    id: string;
    rating: number;
    status: string;
    user: { name: string | null } | null;
    product: { name: string; slug: string };
  }>;
}

export default function DashboardClient({
  statsData = {} as NonNullable<DashboardClientProps["statsData"]>,
  recentBlogs = [],
  recentReviews = [],
}: DashboardClientProps) {
  const {
    totalProducts = 0,
    publishedProducts = 0,
    featuredProducts = 0,
    totalBlogs = 0,
    publishedBlogs = 0,
    pendingBlogs = 0,
    draftBlogs = 0,
    totalUsers = 0,
    totalAuthors = 0,
    totalComments = 0,
    totalReviews = 0,
    pendingReviews = 0,
  } = statsData || {};

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <ShoppingOutlined />,
      href: "/admin/products",
    },
    {
      title: "Published Products",
      value: publishedProducts,
      icon: <ShoppingOutlined />,
      href: "/admin/products",
    },
    {
      title: "Featured Products",
      value: featuredProducts,
      icon: <StarOutlined />,
      href: "/admin/products",
    },
    {
      title: "Total Articles",
      value: totalBlogs,
      icon: <ReadOutlined />,
      href: "/admin/blogs",
    },
    {
      title: "Published Articles",
      value: publishedBlogs,
      icon: <ReadOutlined />,
      href: "/admin/blogs",
    },
    {
      title: "Pending Review",
      value: pendingBlogs,
      icon: <ClockCircleOutlined />,
      href: "/admin/blogs",
    },
    {
      title: "Drafts",
      value: draftBlogs,
      icon: <ReadOutlined />,
      href: "/admin/blogs",
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: <TeamOutlined />,
      href: "/admin/users",
    },
    {
      title: "Authors",
      value: totalAuthors,
      icon: <TeamOutlined />,
      href: "/admin/users",
    },
    {
      title: "Comments",
      value: totalComments,
      icon: <CommentOutlined />,
      href: "/admin/comments",
    },
    {
      title: "Product Reviews",
      value: totalReviews,
      icon: <StarOutlined />,
      href: "/admin/reviews",
    },
    {
      title: "Pending Reviews",
      value: pendingReviews,
      icon: <ClockCircleOutlined />,
      href: "/admin/reviews",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col xs={12} sm={8} lg={4} key={s.title}>
            <Link href={s.href}>
              <Card hoverable size="small">
                <Statistic title={s.title} value={s.value} prefix={s.icon} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Row gutter={16} className="mt-6">
        <Col xs={24} lg={12}>
          <Card title="Recent Articles">
            {recentBlogs.length === 0 ? (
              <p className="text-sm text-gray-400">No articles yet</p>
            ) : (
              <div className="space-y-3">
                {recentBlogs.map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/blogs/${b.slug}`}
                    className="flex items-center justify-between border-b pb-2 last:border-none hover:bg-gray-50 -mx-2 px-2 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{b.title}</p>
                      <p className="text-xs text-gray-400">
                        by {b.author?.name || "Unknown"}
                      </p>
                    </div>
                    <Tag color={statusColor[b.status]}>
                      {b.status.replace("_", " ")}
                    </Tag>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Reviews">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/products/${r.product.slug}`}
                    className="flex items-center justify-between border-b pb-2 last:border-none hover:bg-gray-50 -mx-2 px-2 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{r.product.name}</p>
                      <p className="text-xs text-gray-400">
                        {r.rating}★ by {r.user?.name || "Anonymous"}
                      </p>
                    </div>
                    <Tag
                      color={
                        r.status === "PENDING"
                          ? "orange"
                          : r.status === "APPROVED"
                            ? "green"
                            : "red"
                      }
                    >
                      {r.status}
                    </Tag>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
