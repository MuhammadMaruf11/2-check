"use client";

import { Form, Checkbox } from "antd";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";

interface FormCheckboxInputProps {
  name: string;
  control: Control<FieldValues>;
  label: string;
  className?: string;
  error?: FieldError;
  disabled?: boolean;
}

const FormCheckboxInput: React.FC<FormCheckboxInputProps> = ({
  name,
  control,
  label,
  error,
  className,
  disabled = false,
}) => (
  <Form.Item
    help={error?.message}
    validateStatus={error ? "error" : ""}
    className={`${className} mb-3`}
    labelCol={{ span: 24 }}
  >
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          {...field}
          checked={!!field.value}
          disabled={disabled}
          onChange={(e) => field.onChange(e.target.checked)}
        >
          {label}
        </Checkbox>
      )}
    />
  </Form.Item>
);

export default FormCheckboxInput;
