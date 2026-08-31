"use client";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  CommentOutlined,
  StarOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { signOut } from "next-auth/react";

const { Sider } = Layout;

export default function UserSidebar() {
  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: <Link href="/user">Dashboard</Link>,
    },
    {
      key: "2",
      icon: <StarOutlined />,
      label: <Link href="/user/reviews">My Reviews</Link>,
    },
    {
      key: "4",
      icon: <CommentOutlined />,
      label: <Link href="/user/comments">Comments & Replies</Link>,
    },
    {
      key: "5",
      icon: <UserOutlined />,
      label: <Link href="/user/profile">Profile</Link>,
    },
    {
      key: "6",
      icon: <SettingOutlined />,
      label: <Link href="/user/settings">Settings</Link>,
    },
    {
      key: "7",
      icon: <HomeOutlined />,
      label: <Link href="/">View Site</Link>,
    },
    {
      key: "8",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => signOut({ callbackUrl: "/" }),
    },
  ];

  return (
    <Sider width={250} className="min-h-screen bg-slate-900">
      <div className="p-4 text-white font-bold text-xl text-center">
        User Panel
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={menuItems}
      />
    </Sider>
  );
}
