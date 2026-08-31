'use client';
import { PlayCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";

export function PlayIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <PlayCircleOutlined className={className} style={style} />;
}

export function ArrowIcon({ className }: { className?: string }) {
  return <ArrowRightOutlined className={className} />;
}