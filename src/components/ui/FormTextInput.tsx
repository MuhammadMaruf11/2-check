// components/common/FormTextInput.tsx
"use client";
import { Form, Input } from "antd";
import { ReactNode } from "react";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";

interface FormTextInputProps<T extends FieldValues = FieldValues> {
  name: string;
  control: Control<T>;
  label: string;
  className?: string;
  placeholder?: string;
  type?: "text" | "email" | "url";
  error?: FieldError;
  disabled?: boolean;
  prefix?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormTextInput: React.FC<FormTextInputProps> = ({
  name,
  control,
  label,
  placeholder,
  type = "text",
  error,
  className,
  disabled = false,
  prefix,
  onChange,
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
        <Input
          {...field}
          prefix={prefix}
          onChange={(e) => {
            field.onChange(e);
            if (onChange) onChange(e);
          }}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    />
  </Form.Item>
);

export default FormTextInput;
