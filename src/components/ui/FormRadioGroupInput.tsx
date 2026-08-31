// components/common/FormRadioGroupInput.tsx
"use client";

import { Form, Radio } from "antd";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";

interface Option {
  label: React.ReactNode;
  value: string;
}

interface Props {
  name: string;
  control: Control<FieldValues>;
  label: string;
  options: Option[];
  error?: FieldError;
  className?: string;
}

const FormRadioGroupInput: React.FC<Props> = ({
  name,
  control,
  label,
  options,
  className,
  error,
}) => (
  <Form.Item
    label={label}
    className={`${className} mb-3`}
    help={error?.message}
    validateStatus={error ? "error" : ""}
    labelCol={{ span: 24 }}
  >
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Radio.Group {...field} className="flex gap-3 w-full">
          {options.map((option) => (
            <Radio.Button
              key={option.value}
              value={option.value}
              className="flex-1 text-center"
            >
              {option.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      )}
    />
  </Form.Item>
);

export default FormRadioGroupInput;
