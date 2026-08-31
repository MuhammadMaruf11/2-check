// components/common/FormDatePicker.tsx
"use client";
import { Form, DatePicker } from "antd";
import { Controller, Control, FieldError, FieldValues } from "react-hook-form";
import dayjs from "dayjs";

interface FormDatePickerProps {
  name: string;
  control: Control<FieldValues>;
  label: string;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  showTime?: boolean;
  format?: string;
  className?: string;
  picker?: "date" | "week" | "month" | "quarter" | "year";
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  name,
  control,
  label,
  placeholder,
  error,
  className,
  disabled = false,
  showTime = false,
  format = "YYYY-MM-DD",
  picker = "date",
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
        <DatePicker
          {...field}
          value={field.value ? dayjs(field.value, format) : null}
          onChange={(date) =>
            field.onChange(date ? date.format(format) : null)
          }
          placeholder={placeholder}
          disabled={disabled}
          showTime={showTime}
          format={format}
          picker={picker}
          style={{ width: "100%" }}
        />
      )}
    />
  </Form.Item>
);

export default FormDatePicker;
