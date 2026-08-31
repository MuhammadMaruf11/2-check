/* eslint-disable @typescript-eslint/no-explicit-any */
// components/common/FormTextArea.tsx
"use client";
import { Form, Input } from "antd";
import { Controller, Control, FieldError } from "react-hook-form";

interface FormTextAreaProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  className?: string;
  error?: FieldError;
  disabled?: boolean;
  rows?: number;
  prefix?: any;
}

const { TextArea } = Input;

const FormTextArea: React.FC<FormTextAreaProps> = ({
  name,
  control,
  label,
  placeholder,
  error,
  className,
  disabled = false,
  rows = 4,
  prefix,
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
      render={({ field }) => (
        <TextArea
          {...field}
          prefix={prefix}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
      )}
    />
  </Form.Item>
);

export default FormTextArea;
