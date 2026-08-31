"use client";

import { CheckOutlined, CloseOutlined, PlayCircleOutlined } from "@ant-design/icons";

export function CheckIcon({ className }: { className?: string }) {
  return <CheckOutlined className={className} />;
}

export function CloseIcon({ className }: { className?: string }) {
  return <CloseOutlined className={className} />;
}

export function PlayIcon({ size = 40 }: { size?: number }) {
  return <PlayCircleOutlined style={{ fontSize: size }} />;
}