"use client";

import { Form, InputNumber } from "antd";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";

interface FormNumberInputProps {
  name: string;
  control: Control<FieldValues>;
  label?: string;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: FieldError;
  disabled?: boolean;
  prefix?: React.ReactNode;
  onChange?: (value: number) => number | void;
}

const FormNumberInput: React.FC<FormNumberInputProps> = ({
  name,
  control,
  label,
  placeholder,
  min,
  max,
  step,
  error,
  className,
  disabled = false,
  prefix,
  onChange,
}) => {
  return (
    <Form.Item
      label={label}
      help={error?.message}
      validateStatus={error ? "error" : ""}
      className={`${className ?? ""} mb-3`}
      labelCol={{ span: 24 }}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputNumber
            {...field}
            prefix={prefix}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            placeholder={placeholder}
            style={{ width: "100%" }}
            value={field.value ?? 0}
            onChange={(value) => {
              let val = value ?? 0;

              // parent guard
              if (onChange) {
                const returned = onChange(val);
                if (typeof returned === "number") val = returned;
              }

              field.onChange(val); // <-- RHF update
            }}
          />
        )}
      />
    </Form.Item>
  );
};

export default FormNumberInput;
