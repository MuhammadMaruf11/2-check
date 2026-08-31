"use client";

import Link from "next/link";
import { Card, Row, Col, Statistic } from "antd";
import {
  CommentOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

interface UserDashboardClientProps {
  userName: string;
  stats: {
    totalReviews: number;
    approvedReviews: number;
    pendingReviews: number;
    totalComments: number;
  };
}

export default function UserDashboardClient({
  userName,
  stats,
}: UserDashboardClientProps) {
  const { totalReviews, approvedReviews, pendingReviews, totalComments } =
    stats;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Welcome back, {userName}</h1>
      <p className="text-gray-500 text-sm mb-6">
        Here&apos;s a summary of your activity on TechToCheck.
      </p>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Link href="/user/reviews">
            <Card hoverable size="small">
              <Statistic
                title="My Reviews"
                value={totalReviews}
                prefix={<StarOutlined />}
              />
            </Card>
          </Link>
        </Col>
        <Col xs={12} sm={6}>
          <Link href="/user/reviews">
            <Card hoverable size="small">
              <Statistic
                title="Approved"
                value={approvedReviews}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Link>
        </Col>
        <Col xs={12} sm={6}>
          <Link href="/user/reviews">
            <Card hoverable size="small">
              <Statistic
                title="Pending"
                value={pendingReviews}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Link>
        </Col>
        <Col xs={12} sm={6}>
          <Link href="/user/comments">
            <Card hoverable size="small">
              <Statistic
                title="My Comments"
                value={totalComments}
                prefix={<CommentOutlined />}
              />
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}
