"use client";
import { Form, Input } from "antd";
import { ReactNode } from "react";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";

interface FormPasswordInputProps {
  name: string;
  control: Control<FieldValues>;
  label: string;
  className?: string;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  prefix?: ReactNode;
}

const { Password } = Input;

const FormPasswordInput: React.FC<FormPasswordInputProps> = ({
  name,
  control,
  label,
  placeholder,
  error,
  className,
  disabled = false,
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
        <Password
          {...field}
          prefix={prefix}
          placeholder={placeholder}
          disabled={disabled}
          className=""
        />
      )}
    />
  </Form.Item>
);

export default FormPasswordInput;
