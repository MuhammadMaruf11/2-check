// components/common/FormSwitchInput.tsx
"use client";
import { Form, Switch } from "antd";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";

interface FormSwitchInputProps {
  name: string;
  control: Control<FieldValues>;
  label: string;
  className?: string;
  error?: FieldError;
  disabled?: boolean;
}

const FormSwitchInput: React.FC<FormSwitchInputProps> = ({
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
        <Switch
          {...field}
          checked={field.value}
          disabled={disabled}
          onChange={(checked) => field.onChange(checked)}
        />
      )}
    />
  </Form.Item>
);

export default FormSwitchInput;
