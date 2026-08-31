/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select, Form } from "antd";

interface Props {
  label: string;
  value?: any;
  options: { value: any; label: string }[];
  onChange?: (v: any) => void;
  onFocus?: () => void;
  loading?: boolean;
  className?: string;
}

export default function SimpleSelect({
  label,
  value,
  options,
  onChange,
  onFocus,
  loading,
  className,
}: Props) {
  return (
    <Form.Item label={label} className={`${className} mb-3`}>
      <Select
        value={value}
        options={options}
        onChange={onChange}
        loading={loading}
        onFocus={onFocus}
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
}
