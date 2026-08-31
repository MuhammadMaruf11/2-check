"use client";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ReadOutlined,
  FileTextOutlined,
  MailOutlined,
  LogoutOutlined,
  CommentOutlined,
  StarOutlined,
  AppstoreOutlined,
  NotificationOutlined,
  TeamOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { signOut } from "next-auth/react";

const { Sider } = Layout;

export default function AdminSidebar() {
  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "2",
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/products">Products</Link>,
    },
    {
      key: "2b",
      icon: <AppstoreOutlined />,
      label: <Link href="/admin/categories">Categories</Link>,
    },
    {
      key: "3",
      icon: <ReadOutlined />,
      label: <Link href="/admin/blogs">Blogs</Link>,
    },
    {
      key: "4",
      icon: <FileTextOutlined />,
      label: <Link href="/admin/news">News</Link>,
    },
    {
      key: "5",
      icon: <MailOutlined />,
      label: <Link href="/admin/messages">Messages</Link>,
    },
    {
      key: "5b",
      icon: <NotificationOutlined />,
      label: <Link href="/admin/newsletter">Newsletter</Link>,
    },
    {
      key: "6",
      icon: <CommentOutlined />,
      label: <Link href="/admin/comments">Manage Comments</Link>,
    },
    {
      key: "7",
      icon: <StarOutlined />,
      label: <Link href="/admin/reviews">Manage Reviews</Link>,
    },
    {
      key: "7b",
      icon: <TeamOutlined />,
      label: <Link href="/admin/users">Users</Link>,
    },
    {
      key: "8",
      icon: <HomeOutlined />,
      label: <Link href="/">View Site</Link>,
    },
    {
      key: "9",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <Sider width={250} className="min-h-screen bg-slate-900 shadow-lg">
      <div className="p-6 text-white font-bold text-2xl text-center border-b border-slate-700 mb-2">
        Admin Panel
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={menuItems}
        className="bg-transparent"
      />
    </Sider>
  );
}
