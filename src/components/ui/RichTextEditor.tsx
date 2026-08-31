/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Button, Input, Select, Modal } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  LinkOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  SmileOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  EditOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { FontSize } from "./FontSizeExtension";

/**
 * Shared Tiptap-based rich text field. Used for both blog paragraph blocks
 * (BlogContentEditor) and the product long description (ProductForm), so the
 * editing experience and output HTML shape stay consistent across both.
 */
export default function RichTextEditor({
  value,
  onChange,
  minHeight = "min-h-37.5",
}: {
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontSize,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;

    const updateLink = () => {
      if (editor.isActive("link")) {
        setActiveLink(editor.getAttributes("link").href || "");
      } else {
        setActiveLink("");
      }
    };

    editor.on("selectionUpdate", updateLink);
    editor.on("transaction", updateLink);

    return () => {
      editor.off("selectionUpdate", updateLink);
      editor.off("transaction", updateLink);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "bottom", offset: 8, flip: true }}
          shouldShow={({ editor }) => editor.isActive("link")}
        >
          <div className="bg-white p-2 border border-primary/50 hover:border-primary/80 flex gap-2">
            <span className="text-gray-600 truncate max-w-50">{activeLink}</span>
            <Button
              variant="filled"
              color="blue"
              size="small"
              onClick={() => {
                const previousUrl = editor.getAttributes("link").href;
                setLinkUrl(previousUrl || "");
                setIsEditingLink(true);
                setIsModalVisible(true);
              }}
            >
              <EditOutlined />
            </Button>
            <Button
              size="small"
              variant="filled"
              color="red"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
              }}
            >
              <DisconnectOutlined />
            </Button>
          </div>
        </BubbleMenu>
      )}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300 items-center">
        <Button size="small" onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldOutlined />
        </Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicOutlined />
        </Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineOutlined />
        </Button>

        <Button size="small" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeftOutlined />
        </Button>
        <Button size="small" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenterOutlined />
        </Button>
        <Button size="small" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRightOutlined />
        </Button>

        <Select
          size="small"
          placeholder="Size"
          style={{ width: 80 }}
          onSelect={(value) => {
            editor.chain().focus().setFontSize(value).run();
          }}
        >
          <Select.Option value="12px">12px</Select.Option>
          <Select.Option value="16px">16px</Select.Option>
          <Select.Option value="20px">20px</Select.Option>
          <Select.Option value="24px">24px</Select.Option>
          <Select.Option value="28px">28px</Select.Option>
          <Select.Option value="32px">32px</Select.Option>
          <Select.Option value="36px">36px</Select.Option>
          <Select.Option value="40px">40px</Select.Option>
          <Select.Option value="44px">44px</Select.Option>
          <Select.Option value="48px">48px</Select.Option>
        </Select>

        <input
          type="color"
          onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-6 cursor-pointer"
        />

        <Button size="small" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <UnorderedListOutlined />
        </Button>
        <Button size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <OrderedListOutlined />
        </Button>

        <Button size="small" onClick={() => setIsModalVisible(true)}>
          <LinkOutlined />
        </Button>

        <Select
          size="small"
          style={{ width: 50 }}
          placeholder={<SmileOutlined />}
          onChange={(e) => editor.chain().focus().insertContent(e).run()}
        >
          {["😀", "😂", "😍", "👍", "🎉"].map((e) => (
            <Select.Option key={e} value={e}>
              {e}
            </Select.Option>
          ))}
        </Select>
      </div>

      <EditorContent editor={editor} className={`p-4 ${minHeight} **:outline-none`} />

      <Modal
        title={isEditingLink ? "Edit Link" : "Insert Link"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditingLink(false);
          setLinkUrl("");
        }}
        onOk={() => {
          if (!linkUrl) return;
          editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
          setIsModalVisible(false);
          setIsEditingLink(false);
          setLinkUrl("");
        }}
      >
        <Input value={linkUrl} placeholder="https://example.com" onChange={(e) => setLinkUrl(e.target.value)} />
      </Modal>
    </div>
  );
}
