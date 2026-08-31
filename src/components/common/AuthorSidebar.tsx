"use client";
import { Layout, Menu } from "antd";
import { DashboardOutlined, ReadOutlined, CommentOutlined, LogoutOutlined, HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { signOut } from "next-auth/react";

const { Sider } = Layout;

export default function AuthorSidebar() {
  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: <Link href="/author">Dashboard</Link> },
    { key: "2", icon: <ReadOutlined />, label: <Link href="/author/posts">My Posts</Link> },
    { key: "3", icon: <CommentOutlined />, label: <Link href="/author/comments">Comments</Link> },
    { key: "4", icon: <HomeOutlined />, label: <Link href="/">View Site</Link> },
    {
      key: "5",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <Sider width={250} className="min-h-screen bg-slate-900 shadow-lg">
      <div className="p-6 text-white font-bold text-2xl text-center border-b border-slate-700 mb-2">
        Author Studio
      </div>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]} items={menuItems} className="bg-transparent" />
    </Sider>
  );
}
