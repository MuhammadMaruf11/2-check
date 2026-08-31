/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Form, Select } from "antd";
import { ReactNode } from "react";
import { Controller, Control, FieldError } from "react-hook-form";

const { Option } = Select;

interface FormSelectInputProps {
  name: string;
  control?: Control<any>;
  label: string;
  mode?: "multiple" | "tags";
  optionFilterProp?: string;
  showSearch?: boolean;
  options: {
    key?: string | number;
    value: string | number;
    label: string | ReactNode;
  }[];
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  onFocus?: () => void;
  onChange?: (value: string) => void;
  className?: string;
  loading?: boolean;
  prefix?: React.ReactNode;
}

const FormSelectInput: React.FC<FormSelectInputProps> = ({
  name,
  control,
  mode,
  showSearch = false,
  optionFilterProp,
  label,
  options,
  placeholder,
  error,
  disabled = false,
  onFocus,
  onChange,
  className,
  loading,
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
        <Select
          {...field}
          mode={mode}
          showSearch={showSearch}
          optionFilterProp={optionFilterProp}
          prefix={prefix}
          loading={loading}
          placeholder={placeholder}
          disabled={disabled}
          style={{ width: "100%" }}
          onFocus={onFocus}
          onChange={(value) => {
            field.onChange(value);
            if (onChange) onChange(value);
          }}
        >
          {options.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      )}
    />
  </Form.Item>
);

export default FormSelectInput;
