"use client";
import { Form, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";
import type { UploadFile } from "antd/es/upload/interface";

const { Dragger } = Upload;

interface FormFileInputProps {
  name: string;
  control: Control<FieldValues>;
  label: string;
  className?: string;
  error?: FieldError;
  disabled?: boolean;
  maxCount?: number;
  accept?: string;
  listType?: "text" | "picture" | "picture-card";
  showPreview?: boolean;
  onchange?: (file: File | null) => void;
}

const FormDragFileInput: React.FC<FormFileInputProps> = ({
  name,
  control,
  label,
  error,
  className,
  disabled = false,
  maxCount = 1,
  accept = "image/*",
  listType = "picture-card",
  showPreview = false,
  onchange,
}) => (
  <Form.Item
    label={label}
    help={error?.message}
    validateStatus={error ? "error" : ""}
    className={`${className} mb-3`}
    labelCol={{ span: 24 }}
  >
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => {
        const fileList: UploadFile[] = value
          ? [
              {
                uid: "-1",
                name: value.name,
                status: "done",
                url: showPreview ? URL.createObjectURL(value) : undefined,
                originFileObj: value,
              },
            ]
          : [];

        return (
          <Dragger
            beforeUpload={() => false}
            accept={accept}
            listType={listType}
            fileList={fileList}
            maxCount={maxCount}
            disabled={disabled}
            onChange={(info) => {
              const file = info.fileList[0]?.originFileObj || null;
              onChange(file);
              onchange?.(file);
            }}
            onRemove={() => {
              onChange(null);
              onchange?.(null);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Supports single upload. Image preview will be shown.
            </p>
          </Dragger>
        );
      }}
    />
  </Form.Item>
);

export default FormDragFileInput;
