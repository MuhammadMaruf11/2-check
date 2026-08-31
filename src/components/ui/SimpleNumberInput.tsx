import { InputNumber, Form } from "antd";

interface Props {
  label: string;
  min?: number;
  value?: number;
  onChange?: (v: number) => void;
  className?: string;
}

export default function SimpleNumberInput({
  label,
  min,
  value,
  onChange,
  className,
}: Props) {
  return (
    <Form.Item label={label} className={`${className} mb-3`}>
      <InputNumber
        min={min}
        value={value}
        onChange={(v) => onChange?.(v ?? 0)}
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
}
