/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Input, Upload, Card, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Image from "next/image";
import RichTextEditor from "@/components/ui/RichTextEditor";

export default function BlogContentEditor({ blocks, onChange }: any) {
  const uid = () => Math.random().toString(36).slice(2, 8);
  const add = (type: any) =>
    onChange([...blocks, { id: uid(), type, value: "" }]);
  const remove = (id: string) =>
    onChange(blocks.filter((b: any) => b.id !== id));
  const update = (id: string, value: string, file?: File) =>
    onChange(blocks.map((b: any) => (b.id === id ? { ...b, value, file } : b)));
  const getYouTubeId = (url: string) =>
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];

  return (
    <div className="space-y-4">
      <div className="bg-[#2c3e50] text-white p-3 font-bold rounded-t-lg">
        Blog Post Writer
      </div>
      {blocks.map((block: any) => (
        <Card key={block.id} className="relative border-gray-200">
          <div className="absolute top-2 right-2">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => remove(block.id)}
            />
          </div>
          {block.type === "paragraph" ? (
            <RichTextEditor
              value={block.value}
              onChange={(val) => update(block.id, val)}
            />
          ) : block.type === "image" ? (
            <div className="space-y-3">
              {block.value ? (
                <Image src={block.value} alt="img" width={800} height={400} />
              ) : (
                <Upload.Dragger
                accept="image/*"
                  beforeUpload={(f) => {
                    update(block.id, URL.createObjectURL(f), f);
                    return false;
                  }}
                >
                  Click/Drag
                </Upload.Dragger>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                value={block.value}
                onChange={(e) => update(block.id, e.target.value)}
                placeholder="YouTube URL..."
              />
              {getYouTubeId(block.value) && (
                <iframe
                  width="100%"
                  height="250"
                  src={`https://www.youtube.com/embed/${getYouTubeId(block.value)}`}
                />
              )}
            </div>
          )}
        </Card>
      ))}
      <Space>
        <Button onClick={() => add("paragraph")}>Paragraph</Button>
        <Button onClick={() => add("image")}>Image</Button>
        <Button onClick={() => add("video")}>Video</Button>
      </Space>
    </div>
  );
}
