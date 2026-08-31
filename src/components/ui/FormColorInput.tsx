// components/common/FormColorInput.tsx
"use client";
import { Form, Input } from "antd";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";

interface FormColorInputProps {
  name: string;
  control: Control<FieldValues>;
  label: string;
  className?: string;
  error?: FieldError;
  disabled?: boolean;
}

const FormColorInput: React.FC<FormColorInputProps> = ({
  name,
  control,
  label,
  error,
  className,
  disabled = false,
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
          type="color"
          disabled={disabled}
          style={{
            width: "60px",
            height: "40px",
            padding: 0,
            cursor: "pointer",
            border: "none",
            background: "transparent",
          }}
        />
      )}
    />
  </Form.Item>
);

export default FormColorInput;
